# Ratings Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add thumbs up/down community ratings for menu items, keyed by `(item_name, dining_hall)`, with aggregate display on cards and a bar graph in the details panel.

**Architecture:** New `ItemRating` model in the `accounts` Django app (mirrors `FavoriteItem`). A single bulk GET endpoint returns all ratings for a given hall. Frontend `useRatings(hall)` hook fetches once per hall, exposes optimistic vote/remove mutations. Rating data is passed as props into `MenuItemCard` and `ItemDetailsPanel`.

**Tech Stack:** Django REST Framework (backend), React + TypeScript (frontend), fetch API (no axios — matches favorites pattern), CSS variables from design system.

---

### Task 1: Backend — ItemRating model

**Files:**
- Modify: `accounts/models.py` (in `/Users/ishanajwani/Documents/HoosHungryBackend/HoosHungryBackend/hooshungrybackend/`)

**Step 1: Add the model**

At the bottom of `accounts/models.py`, after the `FavoriteItem` class, add:

```python
class ItemRating(models.Model):
    DINING_HALL_CHOICES = [
        ('ohill', 'ohill'),
        ('newcomb', 'newcomb'),
        ('runk', 'runk'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ratings')
    item_name = models.CharField(max_length=200)
    dining_hall = models.CharField(max_length=10, choices=DINING_HALL_CHOICES)
    is_upvote = models.BooleanField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'item_name', 'dining_hall')

    def __str__(self):
        vote = 'up' if self.is_upvote else 'down'
        return f"{self.user.username} → {self.item_name} ({self.dining_hall}): {vote}"
```

**Step 2: Generate the migration**

Run from the `hooshungrybackend/` directory:
```bash
python manage.py makemigrations accounts --name itemrating
```

Expected output: `Migrations for 'accounts': accounts/migrations/0007_itemrating.py`

**Step 3: Apply the migration**

```bash
python manage.py migrate
```

Expected: `Applying accounts.0007_itemrating... OK`

**Step 4: Commit**

```bash
git add accounts/models.py accounts/migrations/0007_itemrating.py
git commit -m "feat: add ItemRating model to accounts"
```

---

### Task 2: Backend — Rating views

**Files:**
- Modify: `accounts/views.py`

**Step 1: Add the import at the top of `accounts/views.py`**

Add `ItemRating` to the models import line (line 9):
```python
from .models import Plan, FavoriteItem, ItemRating
```

**Step 2: Add the helper and view at the bottom of `accounts/views.py`**

```python
VALID_HALLS = {'ohill', 'newcomb', 'runk'}


def _rating_aggregate(item_name: str, dining_hall: str, user) -> dict:
    """Return upvote/downvote counts and the requesting user's vote for one item."""
    qs = ItemRating.objects.filter(item_name=item_name, dining_hall=dining_hall)
    upvotes = qs.filter(is_upvote=True).count()
    downvotes = qs.filter(is_upvote=False).count()
    try:
        user_rating = qs.get(user=user)
        user_vote = 'up' if user_rating.is_upvote else 'down'
    except ItemRating.DoesNotExist:
        user_vote = None
    return {'upvotes': upvotes, 'downvotes': downvotes, 'user_vote': user_vote}


@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def ratings(request):
    """
    GET  ?dining_hall=<hall>                         → bulk map of all rated items at that hall
    POST  { item_name, dining_hall, is_upvote }      → upsert vote, returns aggregate
    DELETE { item_name, dining_hall }                → remove vote, returns aggregate
    """
    if request.method == 'GET':
        dining_hall = request.query_params.get('dining_hall', '').strip()
        if dining_hall not in VALID_HALLS:
            return Response(
                {'error': f'dining_hall must be one of: {", ".join(VALID_HALLS)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        rated_names = (
            ItemRating.objects
            .filter(dining_hall=dining_hall)
            .values_list('item_name', flat=True)
            .distinct()
        )
        result = {
            name: _rating_aggregate(name, dining_hall, request.user)
            for name in rated_names
        }
        return Response({'ratings': result})

    elif request.method == 'POST':
        item_name = request.data.get('item_name', '').strip()
        dining_hall = request.data.get('dining_hall', '').strip()
        is_upvote = request.data.get('is_upvote')

        if not item_name or dining_hall not in VALID_HALLS or is_upvote is None:
            return Response(
                {'error': 'item_name, dining_hall, and is_upvote are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        ItemRating.objects.update_or_create(
            user=request.user,
            item_name=item_name,
            dining_hall=dining_hall,
            defaults={'is_upvote': bool(is_upvote)},
        )
        return Response(_rating_aggregate(item_name, dining_hall, request.user))

    else:  # DELETE
        item_name = request.data.get('item_name', '').strip()
        dining_hall = request.data.get('dining_hall', '').strip()

        if not item_name or dining_hall not in VALID_HALLS:
            return Response(
                {'error': 'item_name and dining_hall are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        ItemRating.objects.filter(
            user=request.user, item_name=item_name, dining_hall=dining_hall
        ).delete()
        return Response(_rating_aggregate(item_name, dining_hall, request.user))
```

**Step 3: Commit**

```bash
git add accounts/views.py
git commit -m "feat: add ratings view (GET bulk, POST upsert, DELETE remove)"
```

---

### Task 3: Backend — URL wiring

**Files:**
- Modify: `accounts/urls.py`

**Step 1: Add the route**

Add this line to the `urlpatterns` list in `accounts/urls.py`:

```python
path('ratings/', views.ratings, name='ratings'),
```

Full updated `urlpatterns`:
```python
urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('user/', views.get_current_user, name='current_user'),
    path('use-ai/', views.use_ai_feature, name='use_ai'),
    path('plans/', views.get_user_plans, name='get_plans'),
    path('plans/create/', views.create_plan, name='create_plan'),
    path('plans/<int:plan_id>/delete/', views.delete_plan, name='delete_plan'),
    path('profile/', views.get_profile, name='get_profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('profile/goals/suggest/', views.suggest_goals, name='suggest_goals'),
    path('favorites/', views.get_favorites, name='get_favorites'),
    path('favorites/add/', views.add_favorite, name='add_favorite'),
    path('favorites/remove/', views.remove_favorite, name='remove_favorite'),
    path('ratings/', views.ratings, name='ratings'),
]
```

**Step 2: Verify server starts**

```bash
python manage.py check
```

Expected: `System check identified no issues (0 silenced).`

**Step 3: Commit**

```bash
git add accounts/urls.py
git commit -m "feat: wire ratings endpoint to /accounts/ratings/"
```

---

### Task 4: Backend — Tests

**Files:**
- Modify: `accounts/tests.py`

**Step 1: Write tests**

Add the following test classes to the bottom of `accounts/tests.py`:

```python
from .models import ItemRating


class ItemRatingModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='rater', password='pass')

    def test_can_create_rating(self):
        rating = ItemRating.objects.create(
            user=self.user, item_name='Grilled Chicken', dining_hall='ohill', is_upvote=True
        )
        self.assertEqual(rating.is_upvote, True)
        self.assertEqual(rating.dining_hall, 'ohill')

    def test_unique_together_enforced(self):
        ItemRating.objects.create(
            user=self.user, item_name='Grilled Chicken', dining_hall='ohill', is_upvote=True
        )
        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            ItemRating.objects.create(
                user=self.user, item_name='Grilled Chicken', dining_hall='ohill', is_upvote=False
            )


class RatingsEndpointTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='voter', password='pass')
        self.other = User.objects.create_user(username='other', password='pass')
        self.client = APIClient()
        token, _ = Token.objects.get_or_create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

    def test_get_ratings_requires_auth(self):
        self.client.credentials()
        res = self.client.get('/accounts/ratings/?dining_hall=ohill')
        self.assertEqual(res.status_code, 401)

    def test_get_ratings_invalid_hall(self):
        res = self.client.get('/accounts/ratings/?dining_hall=invalid')
        self.assertEqual(res.status_code, 400)

    def test_get_ratings_empty_hall(self):
        res = self.client.get('/accounts/ratings/?dining_hall=ohill')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['ratings'], {})

    def test_post_vote_creates_rating(self):
        res = self.client.post('/accounts/ratings/', {
            'item_name': 'Grilled Chicken', 'dining_hall': 'ohill', 'is_upvote': True
        }, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['upvotes'], 1)
        self.assertEqual(res.data['downvotes'], 0)
        self.assertEqual(res.data['user_vote'], 'up')

    def test_post_vote_upserts_on_change(self):
        # First vote: upvote
        self.client.post('/accounts/ratings/', {
            'item_name': 'Grilled Chicken', 'dining_hall': 'ohill', 'is_upvote': True
        }, format='json')
        # Change to downvote
        res = self.client.post('/accounts/ratings/', {
            'item_name': 'Grilled Chicken', 'dining_hall': 'ohill', 'is_upvote': False
        }, format='json')
        self.assertEqual(res.data['upvotes'], 0)
        self.assertEqual(res.data['downvotes'], 1)
        self.assertEqual(res.data['user_vote'], 'down')
        # Only one rating row should exist
        self.assertEqual(ItemRating.objects.filter(user=self.user).count(), 1)

    def test_delete_removes_vote(self):
        self.client.post('/accounts/ratings/', {
            'item_name': 'Grilled Chicken', 'dining_hall': 'ohill', 'is_upvote': True
        }, format='json')
        res = self.client.delete('/accounts/ratings/', {
            'item_name': 'Grilled Chicken', 'dining_hall': 'ohill'
        }, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['upvotes'], 0)
        self.assertEqual(res.data['user_vote'], None)

    def test_get_bulk_returns_rated_items(self):
        # Two users vote on same item
        other_token, _ = Token.objects.get_or_create(user=self.other)
        other_client = APIClient()
        other_client.credentials(HTTP_AUTHORIZATION=f'Token {other_token.key}')

        self.client.post('/accounts/ratings/', {
            'item_name': 'Grilled Chicken', 'dining_hall': 'ohill', 'is_upvote': True
        }, format='json')
        other_client.post('/accounts/ratings/', {
            'item_name': 'Grilled Chicken', 'dining_hall': 'ohill', 'is_upvote': False
        }, format='json')

        res = self.client.get('/accounts/ratings/?dining_hall=ohill')
        self.assertIn('Grilled Chicken', res.data['ratings'])
        self.assertEqual(res.data['ratings']['Grilled Chicken']['upvotes'], 1)
        self.assertEqual(res.data['ratings']['Grilled Chicken']['downvotes'], 1)
        self.assertEqual(res.data['ratings']['Grilled Chicken']['user_vote'], 'up')

    def test_ratings_scoped_to_hall(self):
        # Vote at ohill
        self.client.post('/accounts/ratings/', {
            'item_name': 'Grilled Chicken', 'dining_hall': 'ohill', 'is_upvote': True
        }, format='json')
        # Bulk GET for newcomb should not include the ohill vote
        res = self.client.get('/accounts/ratings/?dining_hall=newcomb')
        self.assertEqual(res.data['ratings'], {})
```

**Step 2: Run the tests**

```bash
python manage.py test accounts.tests -v 2
```

Expected: All new tests pass. If any fail, read the error — common issues are missing import of `ItemRating` at the top of `tests.py`.

**Step 3: Commit**

```bash
git add accounts/tests.py
git commit -m "test: add ItemRating model and ratings endpoint tests"
```

---

### Task 5: Frontend — ratingEndpoints.ts

**Files:**
- Create: `hooshungry/src/api/ratingEndpoints.ts`

**Step 1: Create the file**

```typescript
// ratingEndpoints.ts — mirrors favoritesEndpoints.ts pattern

const ACCOUNTS_BASE = `${import.meta.env.VITE_API_BASE}/accounts`;

function authHeaders(extra: Record<string, string> = {}) {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Token ${token}` } : {}),
    ...extra,
  };
}

export interface RatingResult {
  upvotes: number;
  downvotes: number;
  user_vote: "up" | "down" | null;
}

/** Map of item_name → RatingResult for all rated items at a given hall */
export type RatingsMap = Record<string, RatingResult>;

export const ratingsAPI = {
  /** Fetch all ratings for a dining hall in one request. Items with no votes are absent from the map. */
  getRatings: async (dining_hall: string): Promise<RatingsMap> => {
    const res = await fetch(
      `${ACCOUNTS_BASE}/ratings/?dining_hall=${encodeURIComponent(dining_hall)}`,
      { headers: authHeaders() }
    );
    if (!res.ok) throw new Error("Failed to fetch ratings");
    return (await res.json()).ratings as RatingsMap;
  },

  /** Upsert a vote. Handles vote changes (up → down) automatically via update_or_create. */
  submitVote: async (
    item_name: string,
    dining_hall: string,
    is_upvote: boolean
  ): Promise<RatingResult> => {
    const res = await fetch(`${ACCOUNTS_BASE}/ratings/`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ item_name, dining_hall, is_upvote }),
    });
    if (!res.ok) throw new Error("Failed to submit vote");
    return res.json();
  },

  /** Remove the current user's vote for an item at a hall. */
  removeVote: async (
    item_name: string,
    dining_hall: string
  ): Promise<RatingResult> => {
    const res = await fetch(`${ACCOUNTS_BASE}/ratings/`, {
      method: "DELETE",
      headers: authHeaders(),
      body: JSON.stringify({ item_name, dining_hall }),
    });
    if (!res.ok) throw new Error("Failed to remove vote");
    return res.json();
  },
};
```

**Step 2: Verify TypeScript compiles**

```bash
cd hooshungry && npm run build 2>&1 | head -30
```

Expected: No new type errors from this file.

**Step 3: Commit**

```bash
git add hooshungry/src/api/ratingEndpoints.ts
git commit -m "feat: add ratingEndpoints API client"
```

---

### Task 6: Frontend — useRatings hook

**Files:**
- Create: `hooshungry/src/hooks/useRatings.ts`

**Step 1: Create the file**

```typescript
import { useState, useEffect, useCallback } from "react";
import { ratingsAPI, type RatingResult, type RatingsMap } from "../api/ratingEndpoints";
import { useAuth } from "../contexts/AuthContext";

const EMPTY_RATING: RatingResult = { upvotes: 0, downvotes: 0, user_vote: null };

/**
 * Fetches all ratings for a dining hall once. Exposes per-item read access
 * and optimistic vote/remove mutations.
 *
 * Usage in Menu.tsx:
 *   const { getRating, submitVote, removeVote } = useRatings(hall);
 */
export function useRatings(dining_hall: string) {
  const { token } = useAuth();
  const [ratings, setRatings] = useState<RatingsMap>({});

  // Re-fetch whenever hall changes or user logs in/out
  useEffect(() => {
    if (!token) { setRatings({}); return; }
    ratingsAPI.getRatings(dining_hall)
      .then(setRatings)
      .catch(() => {}); // non-critical — cards just show no ratings
  }, [token, dining_hall]);

  /** Read the aggregate for a single item (returns zeros if unrated). */
  const getRating = useCallback(
    (item_name: string): RatingResult => ratings[item_name] ?? EMPTY_RATING,
    [ratings]
  );

  /**
   * Submit or change a vote. Optimistic update: UI updates immediately,
   * reverts to previous state if the request fails.
   */
  const submitVote = useCallback(
    async (item_name: string, is_upvote: boolean) => {
      const snapshot = ratings[item_name] ?? EMPTY_RATING;
      const wasUp = snapshot.user_vote === "up";
      const wasDown = snapshot.user_vote === "down";

      // Optimistic: adjust counts immediately
      setRatings((prev) => ({
        ...prev,
        [item_name]: {
          upvotes: snapshot.upvotes + (is_upvote ? 1 : 0) - (wasUp ? 1 : 0),
          downvotes: snapshot.downvotes + (!is_upvote ? 1 : 0) - (wasDown ? 1 : 0),
          user_vote: is_upvote ? "up" : "down",
        },
      }));

      try {
        const updated = await ratingsAPI.submitVote(item_name, dining_hall, is_upvote);
        setRatings((prev) => ({ ...prev, [item_name]: updated }));
      } catch {
        setRatings((prev) => ({ ...prev, [item_name]: snapshot }));
      }
    },
    [ratings, dining_hall]
  );

  /**
   * Remove the user's vote. Optimistic update with revert on failure.
   */
  const removeVote = useCallback(
    async (item_name: string) => {
      const snapshot = ratings[item_name] ?? EMPTY_RATING;

      setRatings((prev) => ({
        ...prev,
        [item_name]: {
          upvotes: snapshot.upvotes - (snapshot.user_vote === "up" ? 1 : 0),
          downvotes: snapshot.downvotes - (snapshot.user_vote === "down" ? 1 : 0),
          user_vote: null,
        },
      }));

      try {
        const updated = await ratingsAPI.removeVote(item_name, dining_hall);
        setRatings((prev) => ({ ...prev, [item_name]: updated }));
      } catch {
        setRatings((prev) => ({ ...prev, [item_name]: snapshot }));
      }
    },
    [ratings, dining_hall]
  );

  return { getRating, submitVote, removeVote };
}
```

**Step 2: Verify TypeScript compiles**

```bash
npm run build 2>&1 | head -30
```

Expected: No new errors.

**Step 3: Commit**

```bash
git add hooshungry/src/hooks/useRatings.ts
git commit -m "feat: add useRatings hook with optimistic updates"
```

---

### Task 7: Frontend — MenuItemCard rating UI

**Files:**
- Modify: `hooshungry/src/components/menu/MenuItemCard.tsx`

**Step 1: Update the props interface**

At the top of `MenuItemCard.tsx`, after the existing imports, add the `RatingResult` import and update the interface:

```typescript
import type { RatingResult } from "../../api/ratingEndpoints";
```

Update `MenuItemCardProps`:
```typescript
interface MenuItemCardProps {
  item: MenuItem;
  onDetails?: (item: MenuItem) => void;
  onAddToPlan?: (item: MenuItem) => void;
  onFavorite?: (item: MenuItem) => void;
  isFavorited?: boolean;
  ratingData?: RatingResult;
  onVote?: (isUpvote: boolean | null) => void;
}
```

**Step 2: Add a `RatingBadge` component above `SmallMenuItemCard`**

This is a small self-contained component for the thumbs UI. Add it after the import lines, before `SmallMenuItemCard`:

```typescript
interface RatingBadgeProps {
  ratingData?: RatingResult;
  onVote?: (isUpvote: boolean | null) => void;
}

function RatingBadge({ ratingData, onVote }: RatingBadgeProps) {
  const upvotes = ratingData?.upvotes ?? 0;
  const downvotes = ratingData?.downvotes ?? 0;
  const userVote = ratingData?.user_vote ?? null;
  const total = upvotes + downvotes;
  const pct = total > 0 ? Math.round((upvotes / total) * 100) : null;

  const handleThumb = (isUpvote: boolean) => {
    if (!onVote) return;
    // Clicking active vote removes it (toggle off)
    if (userVote === (isUpvote ? "up" : "down")) {
      onVote(null);
    } else {
      onVote(isUpvote);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {pct !== null && (
        <span
          className="font-mono-data"
          style={{ fontSize: "0.65rem", color: "var(--ink-muted)" }}
        >
          {pct}%
        </span>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); handleThumb(true); }}
        aria-label="Thumbs up"
        style={{
          background: "none",
          border: "none",
          cursor: onVote ? "pointer" : "default",
          padding: 0,
          fontSize: "0.85rem",
          color: userVote === "up" ? "var(--amber)" : "var(--ink-muted)",
          transition: "color 150ms ease",
        }}
      >
        👍
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); handleThumb(false); }}
        aria-label="Thumbs down"
        style={{
          background: "none",
          border: "none",
          cursor: onVote ? "pointer" : "default",
          padding: 0,
          fontSize: "0.85rem",
          color: userVote === "down" ? "var(--orange-deep)" : "var(--ink-muted)",
          transition: "color 150ms ease",
        }}
      >
        👎
      </button>
    </div>
  );
}
```

**Step 3: Update `SmallMenuItemCard` to accept and render ratings**

Update `SmallMenuItemCard` signature and JSX to include `ratingData` and `onVote`. The rating goes in the right-side div alongside the favorite button:

```typescript
function SmallMenuItemCard({ item, onFavorite, isFavorited, ratingData, onVote }: MenuItemCardProps) {
  return (
    <div className="px-4 py-3" style={{ backgroundColor: "var(--warm-white)" }}>
      <div className="flex justify-between items-center gap-4">
        <span className="text-sm" style={{ color: "var(--ink)", fontFamily: "'DM Sans', sans-serif" }}>
          {item.item_name}
        </span>
        <div className="flex items-center gap-2">
          {item.allergens && item.allergens.length > 0 && (
            <span className="text-xs italic" style={{ color: "var(--ink-muted)" }}>
              {item.allergens
                .map((a) => (a.name === "Information Not Available" ? "Incomplete Allergen Info" : a.name))
                .join(", ")}
            </span>
          )}
          <RatingBadge ratingData={ratingData} onVote={onVote} />
          {onFavorite && (
            <button
              onClick={(e) => { e.stopPropagation(); onFavorite(item); }}
              style={{
                background: "none", border: "none", cursor: "pointer", padding: "0 0 0 4px",
                color: isFavorited ? "var(--amber)" : "var(--ink-muted)",
                fontSize: "0.9rem", flexShrink: 0,
                transition: "color 150ms ease",
              }}
              aria-label={isFavorited ? "Remove from favorites" : "Save to favorites"}
            >
              {isFavorited ? "★" : "☆"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Step 4: Update the main `MenuItemCard` to render ratings in the actions row**

The actions row (currently `Details` and `Add to Plan →`) should have rating in the bottom-right. Update the export default function signature and the actions div:

Add `ratingData` and `onVote` to the destructured props:
```typescript
export default function MenuItemCard({ item, onDetails, onAddToPlan, onFavorite, isFavorited, ratingData, onVote }: MenuItemCardProps) {
```

Update the `if (calories === 0)` return:
```typescript
if (calories === 0) return <SmallMenuItemCard item={item} onFavorite={onFavorite} isFavorited={isFavorited} ratingData={ratingData} onVote={onVote} />;
```

Replace the actions div (currently at the bottom of the card) with:
```tsx
{/* Actions */}
<div className="flex items-center justify-between gap-5">
  <div className="flex items-center gap-5">
    <button
      className="text-xs transition-colors"
      style={{ color: "var(--ink-muted)", fontFamily: "'DM Sans', sans-serif", background: "none", border: "none", cursor: "pointer", padding: 0 }}
      onClick={() => onDetails?.(item)}
      onMouseEnter={e => (e.currentTarget.style.color = "var(--ink)")}
      onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-muted)")}
    >
      Details
    </button>
    <button
      className="text-xs flex items-center gap-1"
      style={{ color: "var(--orange)", fontFamily: "'DM Sans', sans-serif", background: "none", border: "none", cursor: "pointer", padding: 0 }}
      onClick={() => onAddToPlan?.(item)}
      onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
    >
      Add to Plan →
    </button>
  </div>
  <RatingBadge ratingData={ratingData} onVote={onVote} />
</div>
```

**Step 5: Build to check types**

```bash
npm run build 2>&1 | head -40
```

Expected: No new type errors.

**Step 6: Commit**

```bash
git add hooshungry/src/components/menu/MenuItemCard.tsx
git commit -m "feat: add RatingBadge to MenuItemCard (thumbs up/down + percentage)"
```

---

### Task 8: Frontend — ItemDetailsPanel bar graph

**Files:**
- Modify: `hooshungry/src/components/menu/ItemDetailsPanel.tsx`

**Step 1: Add import**

At the top of `ItemDetailsPanel.tsx`, after the existing import:
```typescript
import type { RatingResult } from "../../api/ratingEndpoints";
```

**Step 2: Update the props interface**

```typescript
interface ItemDetailsPanelProps {
  item: MenuItem;
  onClose: () => void;
  ratingData?: RatingResult;
  onVote?: (isUpvote: boolean | null) => void;
}
```

**Step 3: Update the function signature**

```typescript
export default function ItemDetailsPanel({
  item,
  onClose,
  ratingData,
  onVote,
}: ItemDetailsPanelProps) {
```

**Step 4: Add a "Community Rating" section**

Insert this section before the `{/* Macros */}` block (around line 147). Add the rating logic at the top of the function body, before the return:

```typescript
const upvotes = ratingData?.upvotes ?? 0;
const downvotes = ratingData?.downvotes ?? 0;
const userVote = ratingData?.user_vote ?? null;
const totalVotes = upvotes + downvotes;
const upPct = totalVotes > 0 ? Math.round((upvotes / totalVotes) * 100) : 0;
const downPct = totalVotes > 0 ? 100 - upPct : 0;

const handleThumb = (isUpvote: boolean) => {
  if (!onVote) return;
  if (userVote === (isUpvote ? "up" : "down")) {
    onVote(null);
  } else {
    onVote(isUpvote);
  }
};
```

Then the JSX section to insert before `{/* Macros */}`:

```tsx
{/* Community Rating */}
<div className="mb-8">
  <h3 className="section-header-label mb-3">Community Rating</h3>
  {totalVotes === 0 ? (
    <p className="text-xs sm:text-sm mb-3" style={{ color: "var(--ink-muted)" }}>
      No ratings yet — be the first!
    </p>
  ) : (
    <div className="space-y-3 mb-4">
      {/* Upvotes bar */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span style={{ color: "var(--ink-muted)" }}>👍 Liked it</span>
          <span className="font-medium" style={{ color: "var(--ink)" }}>
            {upvotes} ({upPct}%)
          </span>
        </div>
        <div className="w-full h-2 rounded-full" style={{ backgroundColor: "var(--rule)" }}>
          <div
            className="h-2 rounded-full"
            style={{
              backgroundColor: "var(--amber)",
              width: `${upPct}%`,
              transition: "width 400ms ease",
            }}
          />
        </div>
      </div>
      {/* Downvotes bar */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span style={{ color: "var(--ink-muted)" }}>👎 Didn't like it</span>
          <span className="font-medium" style={{ color: "var(--ink)" }}>
            {downvotes} ({downPct}%)
          </span>
        </div>
        <div className="w-full h-2 rounded-full" style={{ backgroundColor: "var(--rule)" }}>
          <div
            className="h-2 rounded-full"
            style={{
              backgroundColor: "var(--orange-deep)",
              width: `${downPct}%`,
              transition: "width 400ms ease",
            }}
          />
        </div>
      </div>
    </div>
  )}

  {/* Vote buttons */}
  <div className="flex items-center gap-3">
    <span className="text-xs" style={{ color: "var(--ink-muted)" }}>Your vote:</span>
    <button
      onClick={() => handleThumb(true)}
      style={{
        background: "none", border: "none", cursor: onVote ? "pointer" : "default",
        fontSize: "1.1rem",
        color: userVote === "up" ? "var(--amber)" : "var(--ink-muted)",
        transition: "color 150ms ease",
        padding: "4px 8px",
      }}
      aria-label="Thumbs up"
    >
      👍
    </button>
    <button
      onClick={() => handleThumb(false)}
      style={{
        background: "none", border: "none", cursor: onVote ? "pointer" : "default",
        fontSize: "1.1rem",
        color: userVote === "down" ? "var(--orange-deep)" : "var(--ink-muted)",
        transition: "color 150ms ease",
        padding: "4px 8px",
      }}
      aria-label="Thumbs down"
    >
      👎
    </button>
    {userVote && (
      <button
        onClick={() => onVote?.(null)}
        className="text-xs"
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "var(--ink-muted)", padding: "4px 0",
          textDecoration: "underline",
        }}
      >
        Remove vote
      </button>
    )}
  </div>
</div>
```

**Step 5: Build to check types**

```bash
npm run build 2>&1 | head -40
```

Expected: No new type errors.

**Step 6: Commit**

```bash
git add hooshungry/src/components/menu/ItemDetailsPanel.tsx
git commit -m "feat: add Community Rating bar graph to ItemDetailsPanel"
```

---

### Task 9: Frontend — Wire StationSection

**Files:**
- Modify: `hooshungry/src/components/menu/StationSection.tsx`

**Step 1: Update the props interface**

Add `RatingResult` import and update the interface:

```typescript
import type { RatingResult } from "../../api/ratingEndpoints";

interface StationSectionProps {
  station: Station;
  onDetails: (item: MenuItem) => void;
  onAddToPlan: (item: MenuItem) => void;
  onFavorite?: (item: MenuItem) => void;
  isFavorite?: (name: string) => boolean;
  getRating?: (item_name: string) => RatingResult;
  onVote?: (item_name: string, isUpvote: boolean | null) => void;
}
```

**Step 2: Destructure the new props**

```typescript
export default function StationSection({ station, onDetails, onAddToPlan, onFavorite, isFavorite, getRating, onVote }: StationSectionProps) {
```

**Step 3: Pass rating props to each `MenuItemCard`**

In both the `mainItems.map` and `sides.map` blocks, add `ratingData` and `onVote` to each `<MenuItemCard>`:

For main items:
```tsx
<MenuItemCard
  key={item.id}
  item={item}
  onDetails={() => onDetails(item)}
  onAddToPlan={() => onAddToPlan(item)}
  onFavorite={onFavorite}
  isFavorited={isFavorite?.(item.item_name)}
  ratingData={getRating?.(item.item_name)}
  onVote={onVote ? (isUpvote) => onVote(item.item_name, isUpvote) : undefined}
/>
```

For sides:
```tsx
<MenuItemCard
  key={item.id}
  item={item}
  onFavorite={onFavorite}
  isFavorited={isFavorite?.(item.item_name)}
  ratingData={getRating?.(item.item_name)}
  onVote={onVote ? (isUpvote) => onVote(item.item_name, isUpvote) : undefined}
/>
```

**Step 4: Build to check types**

```bash
npm run build 2>&1 | head -40
```

**Step 5: Commit**

```bash
git add hooshungry/src/components/menu/StationSection.tsx
git commit -m "feat: thread rating props through StationSection to MenuItemCard"
```

---

### Task 10: Frontend — Wire everything in Menu.tsx

**Files:**
- Modify: `hooshungry/src/pages/Menu.tsx`

**Step 1: Add the import**

Add to the existing import block:
```typescript
import { useRatings } from "../hooks/useRatings";
```

**Step 2: Call the hook**

Inside the `Menu` component, after the `useFavorites` call (around line 34), add:
```typescript
const { getRating, submitVote, removeVote } = useRatings(hall);
```

**Step 3: Create a shared `onVote` handler**

Add this below the hook call. It shows the login prompt for unauthenticated users (matching the favorites behavior):
```typescript
const handleVote = (item_name: string, isUpvote: boolean | null) => {
  if (!token) { setShowFavLoginPrompt(true); return; }
  if (isUpvote === null) {
    removeVote(item_name);
  } else {
    submitVote(item_name, isUpvote);
  }
};
```

**Step 4: Pass props to `StationSection`**

In the `displayStations.map(...)` render block, update `<StationSection>` to include:
```tsx
<StationSection
  station={station}
  onDetails={(item) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  }}
  onAddToPlan={(item) => setAddToPlanItem(item)}
  onFavorite={(item) => {
    if (!token) { setShowFavLoginPrompt(true); return; }
    toggleFavorite(item.item_name);
  }}
  isFavorite={isFavorite}
  getRating={getRating}
  onVote={handleVote}
/>
```

**Step 5: Pass props to `ItemDetailsPanel`**

Update the `<ItemDetailsPanel>` render (near the bottom of the file):
```tsx
{isDetailsOpen && selectedItem && (
  <ItemDetailsPanel
    item={selectedItem}
    onClose={() => setIsDetailsOpen(false)}
    ratingData={getRating(selectedItem.item_name)}
    onVote={(isUpvote) => handleVote(selectedItem.item_name, isUpvote)}
  />
)}
```

**Step 6: Build — final check**

```bash
npm run build 2>&1
```

Expected: Clean build, no type errors.

**Step 7: Manual smoke test**

1. Start backend: `python manage.py runserver` (from `hooshungrybackend/`)
2. Start frontend: `npm run dev` (from `hooshungry/`)
3. Log in, go to Menu
4. Verify: thumb buttons appear on each card (bottom-right of actions row)
5. Click thumbs up on an item — it should highlight amber immediately (optimistic)
6. Open Details for the same item — Community Rating section should show the bar
7. Click thumbs down in the panel — vote changes, upvote bar shrinks, downvote bar grows
8. Click "Remove vote" — returns to no vote state
9. Log out — thumb buttons still visible but clicking triggers the login prompt

**Step 8: Commit**

```bash
git add hooshungry/src/pages/Menu.tsx
git commit -m "feat: wire useRatings into Menu page — ratings fully functional"
```
