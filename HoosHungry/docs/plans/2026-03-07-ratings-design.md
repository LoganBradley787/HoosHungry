# Rating Feature Design

**Date:** 2026-03-07
**Status:** Approved

## Overview

Add thumbs up/down ratings for menu items, keyed by `(item_name, dining_hall)`. One vote per user per item per hall. Ratings are community-visible (aggregate counts/percentages shown to all users), but individual votes are private.

## Data Model

New `ItemRating` model in `accounts/models.py`:

```python
class ItemRating(models.Model):
    user         = ForeignKey(User, on_delete=CASCADE, related_name='ratings')
    item_name    = CharField(max_length=200)
    dining_hall  = CharField(max_length=10, choices=[('ohill','ohill'),('newcomb','newcomb'),('runk','runk')])
    is_upvote    = BooleanField()
    created_at   = DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'item_name', 'dining_hall')
```

Rationale: mirrors the `FavoriteItem` pattern; string key avoids coupling to ephemeral scraped `MenuItem` rows (which are re-created daily).

## API Endpoints

All require `IsAuthenticated`. All live under `accounts/urls.py`.

| Method | URL | Body / Params | Response |
|--------|-----|---------------|----------|
| GET | `/accounts/ratings/` | `?item_name=...&dining_hall=...` | `{ upvotes, downvotes, user_vote: "up"\|"down"\|null }` |
| POST | `/accounts/ratings/` | `{ item_name, dining_hall, is_upvote }` | same shape as GET |
| DELETE | `/accounts/ratings/` | `{ item_name, dining_hall }` | same shape as GET |

POST upserts — if a vote already exists for this user/item/hall, it is updated in place (handles vote flipping).

## Frontend Architecture

### `src/api/ratingEndpoints.ts`
Typed wrappers for all three endpoints. Response type:
```ts
interface RatingResult {
  upvotes: number;
  downvotes: number;
  user_vote: 'up' | 'down' | null;
}
```

### `src/hooks/useRating.ts`
Custom hook `useRating(itemName: string, diningHall: string)`.
- Fetches aggregate + user vote on mount
- Optimistic update on vote/remove so UI feels instant
- Exposes: `upvotes`, `downvotes`, `userVote`, `submitVote(isUpvote: boolean)`, `removeVote()`

### `MenuItemCard` changes
- Ratings section in bottom-right of the actions row
- Shows aggregate as `87% 👍 (12)` when ratings exist; omits percentage when 0 ratings
- Thumbs-up highlighted in `--amber`, thumbs-down in `--orange-deep` when active
- Clicking active vote removes it (toggle off)

### `ItemDetailsPanel` changes
- New "Community Rating" section above macros
- Two horizontal bars: upvotes (`--amber`) and downvotes (`--orange-deep`)
- Shows count and percentage for each
- Same thumb buttons to vote / change vote

## Migration

One new migration on `accounts`:
- `accounts/migrations/0007_itemrating.py`

## Excluded from scope

- Dining hall ratings (deferred)
- Rating history / analytics
- Sorting menu items by rating
