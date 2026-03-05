# Meal Planner Enhancement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend the Plan page into a comprehensive meal planner with full nutrient tracking, guided goal setup, and 30-day calorie trend charts.

**Architecture:** Extend existing Django models with all 10 nutrition fields, add two new endpoints (`/plan/history/` and `/accounts/profile/goals/suggest/`), and enhance the React frontend with a GoalSetupModal, extended ProgressStats, CalorieTrend chart, snack section, and per-item nutrition expand.

**Tech Stack:** Django + DRF (backend), React 19 + TypeScript + Tailwind v4 + Vite (frontend). No new dependencies needed — CalorieTrend uses custom SVG. Run backend with `python manage.py runserver` from `hooshungrybackend/`. Run frontend with `npm run dev` from `hooshungry/`.

**Repos:**
- Backend: `/Users/ishanajwani/Documents/HoosHungryBackend/HoosHungryBackend/hooshungrybackend/`
- Frontend: `/Users/ishanajwani/Documents/HoosHungry/HoosHungry/hooshungry/`

---

## Task 1: Extend MealItem with all nutrient fields

**Files:**
- Modify: `plans/models.py`
- Modify: `plans/serializers.py`
- Test: `plans/tests.py`

**Step 1: Write the failing test**

In `plans/tests.py`:

```python
from django.test import TestCase
from django.contrib.auth.models import User
from plans.models import Plan, DailyMealPlan, MealItem
from decimal import Decimal
import datetime

class MealItemNutritionTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='pass')
        self.plan = Plan.objects.create(
            user=self.user,
            week_start_date=datetime.date(2026, 3, 1),
        )
        self.daily = DailyMealPlan.objects.create(
            plan=self.plan,
            date=datetime.date(2026, 3, 3),
        )

    def test_meal_item_stores_extended_nutrients(self):
        item = MealItem.objects.create(
            daily_plan=self.daily,
            meal_type='lunch',
            menu_item_id=1,
            menu_item_name='Test Food',
            servings=Decimal('2.00'),
            calories_per_serving=200,
            protein_per_serving=Decimal('10.00'),
            carbs_per_serving=Decimal('30.00'),
            fat_per_serving=Decimal('5.00'),
            fiber_per_serving=Decimal('3.00'),
            sodium_per_serving=Decimal('400.00'),
            sugar_per_serving=Decimal('8.00'),
            cholesterol_per_serving=Decimal('15.00'),
            saturated_fat_per_serving=Decimal('2.00'),
            trans_fat_per_serving=Decimal('0.00'),
        )
        self.assertEqual(item.total_fiber, Decimal('6.00'))
        self.assertEqual(item.total_sodium, Decimal('800.00'))
        self.assertEqual(item.total_sugar, Decimal('16.00'))
        self.assertEqual(item.total_cholesterol, Decimal('30.00'))
        self.assertEqual(item.total_saturated_fat, Decimal('4.00'))
        self.assertEqual(item.total_trans_fat, Decimal('0.00'))
```

**Step 2: Run test to confirm failure**

```bash
cd /Users/ishanajwani/Documents/HoosHungryBackend/HoosHungryBackend/hooshungrybackend
python manage.py test plans.tests.MealItemNutritionTest -v 2
```

Expected: FAIL — `TypeError: MealItem() got unexpected keyword arguments 'fiber_per_serving'`

**Step 3: Add fields to MealItem in `plans/models.py`**

After the existing `fat_per_serving` field (line ~178), add:

```python
# Extended nutrition (per serving, cached from NutritionInfo)
fiber_per_serving = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
sodium_per_serving = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
sugar_per_serving = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
cholesterol_per_serving = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
saturated_fat_per_serving = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
trans_fat_per_serving = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
```

After the existing `total_fat` field (line ~184), add:

```python
# Extended nutrition totals (computed from per-serving × servings)
total_fiber = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal('0.00'))
total_sodium = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal('0.00'))
total_sugar = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal('0.00'))
total_cholesterol = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal('0.00'))
total_saturated_fat = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal('0.00'))
total_trans_fat = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal('0.00'))
```

In `MealItem.save()`, after the existing total calculations, add:

```python
self.total_fiber = (self.fiber_per_serving or Decimal('0')) * self.servings
self.total_sodium = (self.sodium_per_serving or Decimal('0')) * self.servings
self.total_sugar = (self.sugar_per_serving or Decimal('0')) * self.servings
self.total_cholesterol = (self.cholesterol_per_serving or Decimal('0')) * self.servings
self.total_saturated_fat = (self.saturated_fat_per_serving or Decimal('0')) * self.servings
self.total_trans_fat = (self.trans_fat_per_serving or Decimal('0')) * self.servings
```

**Step 4: Create and run the migration**

```bash
python manage.py makemigrations plans --name="add_extended_nutrients_to_mealitem"
python manage.py migrate
```

**Step 5: Run test to confirm pass**

```bash
python manage.py test plans.tests.MealItemNutritionTest -v 2
```

Expected: PASS

**Step 6: Update `MealItemSerializer` in `plans/serializers.py`**

Add the new fields to the `MealItemSerializer`:

```python
class MealItemSerializer(serializers.ModelSerializer):
    servings = serializers.FloatField()
    total_protein = serializers.FloatField()
    total_carbs = serializers.FloatField()
    total_fat = serializers.FloatField()
    total_fiber = serializers.FloatField()
    total_sodium = serializers.FloatField()
    total_sugar = serializers.FloatField()
    total_cholesterol = serializers.FloatField()
    total_saturated_fat = serializers.FloatField()
    total_trans_fat = serializers.FloatField()
    protein_per_serving = serializers.FloatField(allow_null=True)
    carbs_per_serving = serializers.FloatField(allow_null=True)
    fat_per_serving = serializers.FloatField(allow_null=True)
    fiber_per_serving = serializers.FloatField(allow_null=True)
    sodium_per_serving = serializers.FloatField(allow_null=True)
    sugar_per_serving = serializers.FloatField(allow_null=True)
    cholesterol_per_serving = serializers.FloatField(allow_null=True)
    saturated_fat_per_serving = serializers.FloatField(allow_null=True)
    trans_fat_per_serving = serializers.FloatField(allow_null=True)

    class Meta:
        model = MealItem
        fields = [
            'id', 'menu_item_id', 'menu_item_name', 'meal_type',
            'servings', 'calories_per_serving',
            'protein_per_serving', 'carbs_per_serving', 'fat_per_serving',
            'fiber_per_serving', 'sodium_per_serving', 'sugar_per_serving',
            'cholesterol_per_serving', 'saturated_fat_per_serving', 'trans_fat_per_serving',
            'total_calories', 'total_protein', 'total_carbs', 'total_fat',
            'total_fiber', 'total_sodium', 'total_sugar',
            'total_cholesterol', 'total_saturated_fat', 'total_trans_fat',
            'dining_hall', 'station_name', 'added_at'
        ]
        read_only_fields = [
            'total_calories', 'total_protein', 'total_carbs', 'total_fat',
            'total_fiber', 'total_sodium', 'total_sugar',
            'total_cholesterol', 'total_saturated_fat', 'total_trans_fat',
            'added_at'
        ]
```

**Step 7: Commit**

```bash
cd /Users/ishanajwani/Documents/HoosHungryBackend/HoosHungryBackend/hooshungrybackend
git add plans/models.py plans/serializers.py plans/migrations/ plans/tests.py
git commit -m "feat: extend MealItem with full nutrient tracking (fiber, sodium, sugar, cholesterol, sat/trans fat)"
```

---

## Task 2: Extend DailyMealPlan with full nutrient aggregation

**Files:**
- Modify: `plans/models.py`
- Test: `plans/tests.py`

**Step 1: Write the failing test**

Add to `plans/tests.py`:

```python
class DailyMealPlanNutritionTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='user2', password='pass')
        self.plan = Plan.objects.create(
            user=self.user,
            week_start_date=datetime.date(2026, 3, 1),
        )
        self.daily = DailyMealPlan.objects.create(
            plan=self.plan,
            date=datetime.date(2026, 3, 3),
        )

    def test_daily_plan_aggregates_extended_nutrients(self):
        MealItem.objects.create(
            daily_plan=self.daily,
            meal_type='lunch',
            menu_item_id=1,
            menu_item_name='Food A',
            servings=Decimal('1.00'),
            calories_per_serving=300,
            fiber_per_serving=Decimal('4.00'),
            sodium_per_serving=Decimal('500.00'),
        )
        MealItem.objects.create(
            daily_plan=self.daily,
            meal_type='dinner',
            menu_item_id=2,
            menu_item_name='Food B',
            servings=Decimal('1.00'),
            calories_per_serving=200,
            fiber_per_serving=Decimal('2.00'),
            sodium_per_serving=Decimal('300.00'),
        )
        self.daily.refresh_from_db()
        self.assertEqual(self.daily.total_fiber, Decimal('6.00'))
        self.assertEqual(self.daily.total_sodium, Decimal('800.00'))
```

**Step 2: Run test to confirm failure**

```bash
python manage.py test plans.tests.DailyMealPlanNutritionTest -v 2
```

Expected: FAIL — `AttributeError: 'DailyMealPlan' object has no attribute 'total_fiber'`

**Step 3: Add fields and update `calculate_totals` in `plans/models.py`**

In `DailyMealPlan`, after the existing `total_fat` field, add:

```python
total_fiber = models.DecimalField(max_digits=7, decimal_places=2, default=Decimal('0.00'))
total_sodium = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('0.00'))
total_sugar = models.DecimalField(max_digits=7, decimal_places=2, default=Decimal('0.00'))
total_cholesterol = models.DecimalField(max_digits=7, decimal_places=2, default=Decimal('0.00'))
total_saturated_fat = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal('0.00'))
total_trans_fat = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal('0.00'))
```

Replace the `calculate_totals` method entirely with:

```python
def calculate_totals(self):
    """Recalculate nutritional totals from all meal items"""
    items = self.meal_items.all()
    self.total_calories = sum(item.total_calories for item in items)
    self.total_protein = sum(item.total_protein for item in items)
    self.total_carbs = sum(item.total_carbs for item in items)
    self.total_fat = sum(item.total_fat for item in items)
    self.total_fiber = sum(item.total_fiber for item in items)
    self.total_sodium = sum(item.total_sodium for item in items)
    self.total_sugar = sum(item.total_sugar for item in items)
    self.total_cholesterol = sum(item.total_cholesterol for item in items)
    self.total_saturated_fat = sum(item.total_saturated_fat for item in items)
    self.total_trans_fat = sum(item.total_trans_fat for item in items)
    self.save()
```

**Step 4: Create and run migration**

```bash
python manage.py makemigrations plans --name="add_extended_nutrients_to_dailymealplan"
python manage.py migrate
```

**Step 5: Run test to confirm pass**

```bash
python manage.py test plans.tests.DailyMealPlanNutritionTest -v 2
```

Expected: PASS

**Step 6: Update `get_daily_plan` view in `plans/views.py`**

In the `get_daily_plan` response dict, extend the returned data (the top-level fields alongside `meals` and `goals`):

```python
return Response({
    'date': date,
    'total_calories': daily_plan.total_calories,
    'total_protein': float(daily_plan.total_protein),
    'total_carbs': float(daily_plan.total_carbs),
    'total_fat': float(daily_plan.total_fat),
    'total_fiber': float(daily_plan.total_fiber),
    'total_sodium': float(daily_plan.total_sodium),
    'total_sugar': float(daily_plan.total_sugar),
    'total_cholesterol': float(daily_plan.total_cholesterol),
    'total_saturated_fat': float(daily_plan.total_saturated_fat),
    'total_trans_fat': float(daily_plan.total_trans_fat),
    'meals': {
        'breakfast': MealItemSerializer(meals_by_type['breakfast'], many=True).data,
        'lunch': MealItemSerializer(meals_by_type['lunch'], many=True).data,
        'dinner': MealItemSerializer(meals_by_type['dinner'], many=True).data,
        'snack': MealItemSerializer(meals_by_type['snack'], many=True).data,
    },
    'goals': {
        'calories': plan.daily_calorie_goal,
        'protein': plan.daily_protein_goal,
        'carbs': plan.daily_carbs_goal,
        'fat': plan.daily_fat_goal,
        'fiber': plan.daily_fiber_goal if hasattr(plan, 'daily_fiber_goal') else None,
        'sodium': plan.daily_sodium_goal if hasattr(plan, 'daily_sodium_goal') else None,
    }
})
```

**Step 7: Commit**

```bash
git add plans/models.py plans/views.py plans/migrations/ plans/tests.py
git commit -m "feat: extend DailyMealPlan to aggregate all nutrients"
```

---

## Task 3: Extend Plan with fiber/sodium goals

**Files:**
- Modify: `plans/models.py`
- Modify: `plans/serializers.py`
- Modify: `plans/views.py`

**Step 1: Write the failing test**

Add to `plans/tests.py`:

```python
class PlanFiberSodiumGoalsTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='user3', password='pass')

    def test_plan_has_fiber_and_sodium_goals(self):
        plan = Plan.objects.create(
            user=self.user,
            week_start_date=datetime.date(2026, 3, 1),
            daily_fiber_goal=25,
            daily_sodium_goal=2300,
        )
        self.assertEqual(plan.daily_fiber_goal, 25)
        self.assertEqual(plan.daily_sodium_goal, 2300)
```

**Step 2: Run test to confirm failure**

```bash
python manage.py test plans.tests.PlanFiberSodiumGoalsTest -v 2
```

Expected: FAIL — `TypeError: Plan() got unexpected keyword argument 'daily_fiber_goal'`

**Step 3: Add fields to Plan model in `plans/models.py`**

After `daily_fat_goal`, add:

```python
daily_fiber_goal = models.IntegerField(null=True, blank=True)
daily_sodium_goal = models.IntegerField(null=True, blank=True)
```

**Step 4: Run migration**

```bash
python manage.py makemigrations plans --name="add_fiber_sodium_goals_to_plan"
python manage.py migrate
```

**Step 5: Run test to confirm pass**

```bash
python manage.py test plans.tests.PlanFiberSodiumGoalsTest -v 2
```

Expected: PASS

**Step 6: Update `PlanSerializer` in `plans/serializers.py`**

Add `'daily_fiber_goal', 'daily_sodium_goal'` to the `fields` list.

**Step 7: Update `update_plan_goals` view in `plans/views.py`**

In the existing `update_plan_goals` view, add after the fat goal block:

```python
if 'daily_fiber_goal' in request.data:
    plan.daily_fiber_goal = request.data['daily_fiber_goal']
if 'daily_sodium_goal' in request.data:
    plan.daily_sodium_goal = request.data['daily_sodium_goal']
```

Also update the `get_daily_plan` response's `goals` dict (already done in Task 2 Step 6 — verify it references `plan.daily_fiber_goal` and `plan.daily_sodium_goal` directly, no `hasattr` needed now).

**Step 8: Commit**

```bash
git add plans/models.py plans/serializers.py plans/views.py plans/migrations/ plans/tests.py
git commit -m "feat: add fiber and sodium goals to Plan model"
```

---

## Task 4: Extend UserProfile with goal_type and activity_level

**Files:**
- Modify: `accounts/models.py`
- Modify: `accounts/serializers.py`
- Modify: `accounts/views.py`
- Test: `accounts/tests.py`

**Step 1: Write the failing test**

In `accounts/tests.py`:

```python
from django.test import TestCase
from django.contrib.auth.models import User
from accounts.models import UserProfile

class UserProfileGoalFieldsTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='goaluser', password='pass')

    def test_profile_has_goal_type_and_activity_level(self):
        profile = self.user.profile
        profile.goal_type = 'lose'
        profile.activity_level = 'moderate'
        profile.save()
        profile.refresh_from_db()
        self.assertEqual(profile.goal_type, 'lose')
        self.assertEqual(profile.activity_level, 'moderate')

    def test_goal_type_defaults_to_maintain(self):
        profile = self.user.profile
        self.assertEqual(profile.goal_type, 'maintain')
```

**Step 2: Run test to confirm failure**

```bash
python manage.py test accounts.tests.UserProfileGoalFieldsTest -v 2
```

Expected: FAIL — `AttributeError: 'UserProfile' object has no attribute 'goal_type'`

**Step 3: Add fields to `accounts/models.py`**

In `UserProfile`, after `default_fat_goal`, add:

```python
GOAL_TYPE_CHOICES = [
    ('maintain', 'Maintain Weight'),
    ('lose', 'Lose Weight'),
    ('gain', 'Gain Muscle'),
]
ACTIVITY_LEVEL_CHOICES = [
    ('sedentary', 'Sedentary'),
    ('light', 'Lightly Active'),
    ('moderate', 'Moderately Active'),
    ('active', 'Very Active'),
    ('very_active', 'Extremely Active'),
]

goal_type = models.CharField(max_length=20, choices=GOAL_TYPE_CHOICES, default='maintain')
activity_level = models.CharField(max_length=20, choices=ACTIVITY_LEVEL_CHOICES, default='moderate')
```

**Step 4: Run migration**

```bash
python manage.py makemigrations accounts --name="add_goal_type_activity_level_to_userprofile"
python manage.py migrate
```

**Step 5: Run test to confirm pass**

```bash
python manage.py test accounts.tests.UserProfileGoalFieldsTest -v 2
```

Expected: PASS

**Step 6: Update `accounts/serializers.py`**

Add `'goal_type'` and `'activity_level'` to `UserProfileSerializer.Meta.fields`.

**Step 7: Update `update_profile` view in `accounts/views.py`**

The existing `update_profile` view references `UserProfileSerializer` but never imports it. Fix this and add the new fields. Replace the entire view:

```python
from .serializers import UserSerializer, PlanSerializer, UserProfileSerializer

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update user profile fields"""
    profile = request.user.profile

    updatable = [
        'is_vegan', 'is_vegetarian', 'is_gluten_free',
        'default_calorie_goal', 'default_protein_goal',
        'default_carbs_goal', 'default_fat_goal',
        'goal_type', 'activity_level',
    ]
    for field in updatable:
        if field in request.data:
            setattr(profile, field, request.data[field])

    profile.save()
    serializer = UserProfileSerializer(profile)
    return Response(serializer.data)
```

**Step 8: Commit**

```bash
git add accounts/models.py accounts/serializers.py accounts/views.py accounts/migrations/ accounts/tests.py
git commit -m "feat: add goal_type and activity_level to UserProfile"
```

---

## Task 5: Add /plan/history/ endpoint

**Files:**
- Modify: `plans/views.py`
- Modify: `plans/urls.py`
- Test: `plans/tests.py`

**Step 1: Write the failing test**

Add to `plans/tests.py`:

```python
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from plans.models import Plan, DailyMealPlan
import datetime

class PlanHistoryEndpointTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='historyuser', password='pass')
        self.client = APIClient()
        token, _ = Token.objects.get_or_create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

        # Create a plan and two daily plans
        plan = Plan.objects.create(
            user=self.user,
            week_start_date=datetime.date(2026, 3, 1),
        )
        DailyMealPlan.objects.create(
            plan=plan,
            date=datetime.date(2026, 3, 3),
            total_calories=1800,
        )
        DailyMealPlan.objects.create(
            plan=plan,
            date=datetime.date(2026, 3, 4),
            total_calories=2100,
        )

    def test_history_returns_daily_totals(self):
        response = self.client.get('/api/plan/history/', {'days': 30})
        self.assertEqual(response.status_code, 200)
        self.assertIn('history', response.data)
        dates = [entry['date'] for entry in response.data['history']]
        self.assertIn('2026-03-03', dates)
        self.assertIn('2026-03-04', dates)
```

**Step 2: Run test to confirm failure**

```bash
python manage.py test plans.tests.PlanHistoryEndpointTest -v 2
```

Expected: FAIL — 404 (URL doesn't exist yet)

**Step 3: Add view to `plans/views.py`**

Add at the end of the file:

```python
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_history(request):
    """
    Get daily nutrition totals for the past N days.
    Query params: days (int, default=30, max=90)
    """
    try:
        days = min(int(request.GET.get('days', 30)), 90)
    except (ValueError, TypeError):
        days = 30

    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days - 1)

    # Get all daily plans for this user in the date range
    daily_plans = DailyMealPlan.objects.filter(
        plan__user=request.user,
        date__gte=start_date,
        date__lte=end_date,
    ).order_by('date')

    history = []
    for dp in daily_plans:
        history.append({
            'date': dp.date.isoformat(),
            'total_calories': dp.total_calories,
            'total_protein': float(dp.total_protein),
            'total_carbs': float(dp.total_carbs),
            'total_fat': float(dp.total_fat),
            'total_fiber': float(dp.total_fiber),
            'total_sodium': float(dp.total_sodium),
        })

    return Response({'history': history})
```

Note: `datetime` and `timedelta` are already imported at the top of `plans/views.py`.

**Step 4: Add URL to `plans/urls.py`**

```python
path('history/', views.get_history, name='get_history'),
```

**Step 5: Run test to confirm pass**

```bash
python manage.py test plans.tests.PlanHistoryEndpointTest -v 2
```

Expected: PASS

**Step 6: Commit**

```bash
git add plans/views.py plans/urls.py plans/tests.py
git commit -m "feat: add GET /plan/history/ endpoint for trend charts"
```

---

## Task 6: Add /accounts/profile/goals/suggest/ endpoint

**Files:**
- Modify: `accounts/views.py`
- Modify: `accounts/urls.py`
- Test: `accounts/tests.py`

**Step 1: Write the failing test**

Add to `accounts/tests.py`:

```python
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token

class SuggestGoalsEndpointTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='suggestuser', password='pass')
        self.client = APIClient()
        token, _ = Token.objects.get_or_create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

    def test_suggest_goals_maintain_moderate(self):
        self.user.profile.goal_type = 'maintain'
        self.user.profile.activity_level = 'moderate'
        self.user.profile.save()
        response = self.client.get('/api/accounts/profile/goals/suggest/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('calories', response.data)
        self.assertIn('protein', response.data)
        self.assertIn('carbs', response.data)
        self.assertIn('fat', response.data)
        self.assertGreater(response.data['calories'], 0)

    def test_suggest_goals_lose_sedentary(self):
        self.user.profile.goal_type = 'lose'
        self.user.profile.activity_level = 'sedentary'
        self.user.profile.save()
        response_maintain = self.client.get('/api/accounts/profile/goals/suggest/')
        self.user.profile.goal_type = 'maintain'
        self.user.profile.save()
        response_lose = self.client.get('/api/accounts/profile/goals/suggest/')
        # Lose should suggest fewer calories than maintain
        # Note: sedentary maintain vs sedentary lose
        self.user.profile.goal_type = 'lose'
        self.user.profile.save()
        response = self.client.get('/api/accounts/profile/goals/suggest/')
        self.assertLess(response.data['calories'], 2200)
```

**Step 2: Run test to confirm failure**

```bash
python manage.py test accounts.tests.SuggestGoalsEndpointTest -v 2
```

Expected: FAIL — 404

**Step 3: Add view to `accounts/views.py`**

Add at the end:

```python
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def suggest_goals(request):
    """
    Suggest daily calorie and macro goals based on goal_type and activity_level.
    Uses a simple base calorie formula with activity multipliers.
    """
    profile = request.user.profile

    # Base calories by activity level (approximate maintenance for average adult)
    activity_calories = {
        'sedentary': 1800,
        'light': 2000,
        'moderate': 2200,
        'active': 2500,
        'very_active': 2800,
    }

    # Goal-type adjustment
    goal_adjustments = {
        'maintain': 0,
        'lose': -300,
        'gain': +300,
    }

    base = activity_calories.get(profile.activity_level, 2200)
    adjustment = goal_adjustments.get(profile.goal_type, 0)
    calories = base + adjustment

    # Standard macro splits: protein 25%, carbs 50%, fat 25%
    protein = round((calories * 0.25) / 4)   # 4 kcal/g
    carbs = round((calories * 0.50) / 4)     # 4 kcal/g
    fat = round((calories * 0.25) / 9)       # 9 kcal/g

    return Response({
        'calories': calories,
        'protein': protein,
        'carbs': carbs,
        'fat': fat,
        'fiber': 28,       # Standard recommended daily fiber
        'sodium': 2300,    # FDA recommended daily sodium (mg)
    })
```

**Step 4: Add URL to `accounts/urls.py`**

```python
path('profile/goals/suggest/', views.suggest_goals, name='suggest_goals'),
```

**Step 5: Run test to confirm pass**

```bash
python manage.py test accounts.tests.SuggestGoalsEndpointTest -v 2
```

Expected: PASS

**Step 6: Commit**

```bash
git add accounts/views.py accounts/urls.py accounts/tests.py
git commit -m "feat: add GET /accounts/profile/goals/suggest/ endpoint"
```

---

## Task 7: Populate extended nutrients in add_meal_item view

**Files:**
- Modify: `plans/views.py`
- Test: `plans/tests.py`

**Step 1: Write the failing test**

Add to `plans/tests.py`:

```python
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from api.models import MenuItem, NutritionInfo, DiningHall, Day, Period, Station
import datetime as dt
from decimal import Decimal

class AddMealItemNutritionTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='adduser', password='pass')
        self.client = APIClient()
        token, _ = Token.objects.get_or_create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

        # Build the minimum dining hall → menu item chain
        hall = DiningHall.objects.create(name='ohill', scrape_url='http://test.com')
        day = Day.objects.create(
            date=dt.date(2026, 3, 3),
            day_name='Tuesday',
            open_time=dt.time(7, 0),
            close_time=dt.time(21, 0),
            dining_hall=hall,
        )
        period = Period.objects.create(
            name='Lunch', vendor_id='1', start_time=dt.time(11, 0), end_time=dt.time(14, 0), day=day
        )
        station = Station.objects.create(name='Grill', number='1', period=period)
        self.menu_item = MenuItem.objects.create(
            station=station, item_name='Test Burger', is_vegan=False, is_vegetarian=False
        )
        NutritionInfo.objects.create(
            menu_item=self.menu_item,
            calories=Decimal('500'),
            protein=Decimal('30'),
            total_carbohydrates=Decimal('40'),
            total_fat=Decimal('20'),
            dietary_fiber=Decimal('5'),
            sodium=Decimal('800'),
            total_sugars=Decimal('6'),
            cholesterol=Decimal('70'),
            saturated_fat=Decimal('8'),
            trans_fat=Decimal('0'),
        )

    def test_add_item_populates_extended_nutrients(self):
        response = self.client.post('/api/plan/add-item/', {
            'date': '2026-03-03',
            'menu_item_id': self.menu_item.id,
            'meal_type': 'lunch',
            'servings': 1,
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(float(response.data['total_fiber']), 5.0)
        self.assertEqual(float(response.data['total_sodium']), 800.0)
```

**Step 2: Run test to confirm failure**

```bash
python manage.py test plans.tests.AddMealItemNutritionTest -v 2
```

Expected: FAIL — `total_fiber` is 0.0 (not populated from NutritionInfo)

**Step 3: Update `add_meal_item` in `plans/views.py`**

Find the nutrition extraction block (around lines 151–156). Replace it with:

```python
# Extract nutrition info
nutrition = getattr(api_menu_item, 'nutrition_info', None)
calories = int(nutrition.calories) if nutrition and nutrition.calories else 0
protein = nutrition.protein if nutrition else None
carbs = nutrition.total_carbohydrates if nutrition else None
fat = nutrition.total_fat if nutrition else None
fiber = nutrition.dietary_fiber if nutrition else None
sodium = nutrition.sodium if nutrition else None
sugar = nutrition.total_sugars if nutrition else None
cholesterol = nutrition.cholesterol if nutrition else None
saturated_fat = nutrition.saturated_fat if nutrition else None
trans_fat = nutrition.trans_fat if nutrition else None
```

Then in the `MealItem.objects.create(...)` call, add the new kwargs:

```python
meal_item = MealItem.objects.create(
    daily_plan=daily_plan,
    meal_type=meal_type,
    menu_item_id=menu_item_id,
    menu_item_name=api_menu_item.item_name,
    servings=Decimal(str(servings)),
    calories_per_serving=calories,
    protein_per_serving=protein,
    carbs_per_serving=carbs,
    fat_per_serving=fat,
    fiber_per_serving=fiber,
    sodium_per_serving=sodium,
    sugar_per_serving=sugar,
    cholesterol_per_serving=cholesterol,
    saturated_fat_per_serving=saturated_fat,
    trans_fat_per_serving=trans_fat,
    dining_hall=api_menu_item.station.period.day.dining_hall.name,
    station_name=api_menu_item.station.name,
)
```

**Step 4: Run test to confirm pass**

```bash
python manage.py test plans.tests.AddMealItemNutritionTest -v 2
```

Expected: PASS

**Step 5: Run full test suite**

```bash
python manage.py test -v 2
```

Expected: All tests pass.

**Step 6: Commit**

```bash
git add plans/views.py plans/tests.py
git commit -m "feat: populate extended nutrients when adding meal items from dining hall menu"
```

---

## Task 8: Update frontend TypeScript types

**Files:**
- Modify: `src/api/planEndpoints.ts`
- Create: `src/api/accountEndpoints.ts`

**Step 1: Update `MealItem` and `DailyPlanResponse` in `src/api/planEndpoints.ts`**

Replace the `MealItem` interface:

```typescript
export interface MealItem {
  id: number;
  menu_item_id: number;
  menu_item_name: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  servings: number;
  calories_per_serving: number;
  protein_per_serving: number | null;
  carbs_per_serving: number | null;
  fat_per_serving: number | null;
  fiber_per_serving: number | null;
  sodium_per_serving: number | null;
  sugar_per_serving: number | null;
  cholesterol_per_serving: number | null;
  saturated_fat_per_serving: number | null;
  trans_fat_per_serving: number | null;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_fiber: number;
  total_sodium: number;
  total_sugar: number;
  total_cholesterol: number;
  total_saturated_fat: number;
  total_trans_fat: number;
  dining_hall: string;
  station_name: string;
  added_at: string;
}
```

Replace the `DailyPlanResponse` interface:

```typescript
export interface DailyPlanResponse {
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_fiber: number;
  total_sodium: number;
  total_sugar: number;
  total_cholesterol: number;
  total_saturated_fat: number;
  total_trans_fat: number;
  meals: DayMeals;
  goals: {
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
    fiber: number | null;
    sodium: number | null;
  };
}
```

Add a `HistoryEntry` interface and `getHistory` to the `planAPI` object:

```typescript
export interface HistoryEntry {
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_fiber: number;
  total_sodium: number;
}

// Inside planAPI:
getHistory: async (days = 30): Promise<{ history: HistoryEntry[] }> => {
  const response = await apiClient.get("/plan/history/", { params: { days } });
  return response.data;
},
```

**Step 2: Create `src/api/accountEndpoints.ts`**

```typescript
import apiClient from "./client";

export interface UserProfile {
  remaining_ai_usages: number;
  premium_member: boolean;
  is_vegan: boolean;
  is_vegetarian: boolean;
  is_gluten_free: boolean;
  default_calorie_goal: number | null;
  default_protein_goal: number | null;
  default_carbs_goal: number | null;
  default_fat_goal: number | null;
  goal_type: "maintain" | "lose" | "gain";
  activity_level: "sedentary" | "light" | "moderate" | "active" | "very_active";
}

export interface SuggestedGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
}

export interface UpdateProfileRequest {
  is_vegan?: boolean;
  is_vegetarian?: boolean;
  is_gluten_free?: boolean;
  default_calorie_goal?: number | null;
  default_protein_goal?: number | null;
  default_carbs_goal?: number | null;
  default_fat_goal?: number | null;
  goal_type?: "maintain" | "lose" | "gain";
  activity_level?: "sedentary" | "light" | "moderate" | "active" | "very_active";
}

export const accountAPI = {
  suggestGoals: async (): Promise<SuggestedGoals> => {
    const response = await apiClient.get("/accounts/profile/goals/suggest/");
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const response = await apiClient.patch("/accounts/profile/update/", data);
    return response.data;
  },
};
```

**Step 3: Commit**

```bash
cd /Users/ishanajwani/Documents/HoosHungry/HoosHungry/hooshungry
git add src/api/planEndpoints.ts src/api/accountEndpoints.ts
git commit -m "feat: update TypeScript types for extended nutrients and account endpoints"
```

---

## Task 9: Add Snack section to DailyMealPlan

**Files:**
- Modify: `src/components/plan/DailyMealPlan.tsx`

**Step 1: Update `DailyMealPlan.tsx`**

After the `dinnerCalories` calculation, add:

```typescript
const snackCalories =
  dailyData?.meals.snack.reduce((sum, item) => sum + item.total_calories, 0) || 0;
```

After the `<MealSection title="Dinner" .../>` block, add:

```tsx
<MealSection
  title="Snack"
  totalCalories={snackCalories}
  items={dailyData?.meals.snack || []}
  onItemUpdated={onItemUpdated}
  onItemDeleted={onItemDeleted}
/>
```

**Step 2: Verify in browser**

Start the dev server (`npm run dev` from `hooshungry/`). Navigate to the Plan page. Confirm a Snack section appears below Dinner.

**Step 3: Commit**

```bash
git add src/components/plan/DailyMealPlan.tsx
git commit -m "feat: add Snack section to daily meal plan view"
```

---

## Task 10: Extend MealItemCard with per-item nutrition expand

**Files:**
- Modify: `src/components/plan/MealItemCard.tsx`

**Step 1: Update `MealItemCard.tsx`**

Replace the full file content:

```tsx
import { useState } from "react";
import { Minus, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { planAPI, type MealItem } from "../../api/planEndpoints";

interface MealItemCardProps {
  item: MealItem;
  onItemUpdated: (item: MealItem) => void;
  onItemDeleted: (id: number) => void;
}

function NutrientRow({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="flex justify-between text-xs" style={{ color: "var(--ink-muted)" }}>
      <span>{label}</span>
      <span className="font-mono-data">{Math.round(value * 10) / 10}{unit}</span>
    </div>
  );
}

export default function MealItemCard({ item, onItemUpdated, onItemDeleted }: MealItemCardProps) {
  const [servings, setServings] = useState(Number(item.servings));
  const [isUpdating, setIsUpdating] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleDecrement = async () => {
    if (servings <= 0.25 || isUpdating) return;
    const newServings = Math.max(0.25, Math.round((servings - 0.25) * 100) / 100);
    setServings(newServings);
    try {
      setIsUpdating(true);
      const updated = await planAPI.updateMealItem(item.id, newServings);
      onItemUpdated(updated);
    } catch {
      setServings(Number(item.servings));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleIncrement = async () => {
    if (isUpdating) return;
    const newServings = Math.round((servings + 0.25) * 100) / 100;
    setServings(newServings);
    try {
      setIsUpdating(true);
      const updated = await planAPI.updateMealItem(item.id, newServings);
      onItemUpdated(updated);
    } catch {
      setServings(Number(item.servings));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (isUpdating) return;
    try {
      setIsUpdating(true);
      await planAPI.deleteMealItem(item.id);
      onItemDeleted(item.id);
    } catch {
      setIsUpdating(false);
    }
  };

  const displayCalories = Math.round(item.calories_per_serving * servings);

  return (
    <div
      className="transition-colors"
      style={{ backgroundColor: "var(--warm-white)", border: "1px solid var(--rule)", borderRadius: "6px" }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--orange)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--rule)")}
    >
      <div className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          {/* Item Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-display italic text-base truncate" style={{ color: "var(--ink)" }}>
              {item.menu_item_name}
            </h4>
            <div className="font-mono-data text-xs" style={{ color: "var(--ink-muted)" }}>
              {displayCalories} cal · {Number(servings).toFixed(2)} serving{servings !== 1 ? "s" : ""}
            </div>
            <div className="text-xs mt-0.5 truncate" style={{ color: "var(--ink-muted)", opacity: 0.7 }}>
              {item.dining_hall} · {item.station_name}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between sm:justify-end gap-3">
            {/* Nutrition expand toggle */}
            <button
              onClick={() => setExpanded(e => !e)}
              className="w-7 h-7 flex items-center justify-center rounded transition-colors"
              style={{ color: "var(--ink-muted)" }}
              aria-label={expanded ? "Hide nutrition" : "Show nutrition"}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Serving Adjustment */}
            <div className="flex items-center gap-2 rounded px-1" style={{ backgroundColor: "var(--cream)" }}>
              <button
                onClick={handleDecrement}
                disabled={servings <= 0.25 || isUpdating}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Decrease servings"
              >
                <Minus className="w-4 h-4" style={{ color: "var(--ink-muted)" }} />
              </button>
              <span className="font-mono-data text-xs min-w-[32px] text-center" style={{ color: "var(--ink)" }}>
                {Number(servings).toFixed(2)}
              </span>
              <button
                onClick={handleIncrement}
                disabled={isUpdating}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Increase servings"
              >
                <Plus className="w-4 h-4" style={{ color: "var(--ink-muted)" }} />
              </button>
            </div>

            {/* Delete */}
            <button
              onClick={handleDelete}
              disabled={isUpdating}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 disabled:opacity-40"
              style={{ color: "var(--ink-muted)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-muted)")}
              aria-label="Remove item"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Expandable nutrition panel */}
      {expanded && (
        <div
          className="px-3 sm:px-4 pb-3 pt-1 space-y-1.5 border-t"
          style={{ borderColor: "var(--rule)" }}
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 pt-1">
            <NutrientRow label="Protein" value={item.total_protein} unit="g" />
            <NutrientRow label="Carbs" value={item.total_carbs} unit="g" />
            <NutrientRow label="Fat" value={item.total_fat} unit="g" />
            <NutrientRow label="Fiber" value={item.total_fiber} unit="g" />
            <NutrientRow label="Sodium" value={item.total_sodium} unit="mg" />
            <NutrientRow label="Sugar" value={item.total_sugar} unit="g" />
            <NutrientRow label="Cholesterol" value={item.total_cholesterol} unit="mg" />
            <NutrientRow label="Saturated Fat" value={item.total_saturated_fat} unit="g" />
            <NutrientRow label="Trans Fat" value={item.total_trans_fat} unit="g" />
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Verify in browser**

Confirm each meal item card has a chevron. Clicking it reveals the full nutrition breakdown. Clicking again collapses it.

**Step 3: Commit**

```bash
git add src/components/plan/MealItemCard.tsx
git commit -m "feat: add expandable per-item nutrition panel to MealItemCard"
```

---

## Task 11: Extend ProgressStats with fiber/sodium and expandable panel

**Files:**
- Modify: `src/components/plan/ProgressStats.tsx`

**Step 1: Replace `ProgressStats.tsx`**

```tsx
import { useState } from "react";
import type { DailyPlanResponse } from "../../api/planEndpoints";

interface ProgressStatsProps {
  dailyData: DailyPlanResponse | null;
  goals?: DailyPlanResponse["goals"] | null;
  onSetGoalsClick: () => void;
}

function MacroBar({
  label, current, goal, unit, color,
}: {
  label: string; current: number; goal: number; unit: string; color: string;
}) {
  const pct = goal > 0 ? Math.min(Math.round((current / goal) * 100), 100) : 0;
  return (
    <div className="mb-4">
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-xs uppercase tracking-widest" style={{ color: "var(--ink-muted)", fontFamily: "'DM Sans', sans-serif" }}>
          {label}
        </span>
        <span className="font-mono-data text-xs" style={{ color: "var(--ink-muted)" }}>
          {Math.round(current)}{unit} {goal > 0 ? `/ ${goal}${unit}` : ""}
        </span>
      </div>
      <div className="w-full h-1 rounded-full" style={{ backgroundColor: "var(--rule)" }}>
        <div className="h-1 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function NutrientReadout({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="flex justify-between text-xs py-1" style={{ borderBottom: "1px solid var(--rule)", color: "var(--ink-muted)" }}>
      <span>{label}</span>
      <span className="font-mono-data">{Math.round(value * 10) / 10}{unit}</span>
    </div>
  );
}

export default function ProgressStats({ dailyData, goals, onSetGoalsClick }: ProgressStatsProps) {
  const [showMore, setShowMore] = useState(false);

  const currentCalories = dailyData?.total_calories || 0;
  const goalCalories = goals?.calories || 2000;
  const caloriePercentage = Math.min(Math.round((currentCalories / goalCalories) * 100), 100);

  return (
    <div className="card-editorial p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs uppercase tracking-widest" style={{ color: "var(--ink-muted)", fontFamily: "'DM Sans', sans-serif" }}>
          Today's Progress
        </p>
        <button
          onClick={onSetGoalsClick}
          className="text-xs underline transition-colors"
          style={{ color: "var(--ink-muted)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--orange)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-muted)")}
        >
          Set Goals
        </button>
      </div>

      {/* Calories headline */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="font-display italic" style={{ fontSize: "2.5rem", color: "var(--ink)", lineHeight: 1, fontWeight: 400 }}>
            {currentCalories.toLocaleString()}
          </span>
          <span className="font-mono-data text-sm" style={{ color: "var(--ink-muted)" }}>
            / {goalCalories} kcal
          </span>
        </div>
        <div className="w-full h-1 rounded-full mt-3" style={{ backgroundColor: "var(--rule)" }}>
          <div className="h-1 rounded-full transition-all duration-500" style={{ width: `${caloriePercentage}%`, backgroundColor: "var(--orange)" }} />
        </div>
      </div>

      <hr className="editorial-rule mb-5" />

      {/* Primary macros */}
      <MacroBar label="Protein" current={dailyData?.total_protein || 0} goal={goals?.protein || 150} unit="g" color="var(--amber)" />
      <MacroBar label="Carbs" current={dailyData?.total_carbs || 0} goal={goals?.carbs || 250} unit="g" color="var(--terracotta)" />
      <MacroBar label="Fat" current={dailyData?.total_fat || 0} goal={goals?.fat || 65} unit="g" color="var(--terracotta)" />

      <hr className="editorial-rule mb-4 mt-2" />

      {/* Secondary: fiber & sodium */}
      <MacroBar label="Fiber" current={dailyData?.total_fiber || 0} goal={goals?.fiber || 28} unit="g" color="var(--amber)" />
      <MacroBar label="Sodium" current={dailyData?.total_sodium || 0} goal={goals?.sodium || 2300} unit="mg" color="var(--terracotta)" />

      {/* Expand toggle */}
      <button
        onClick={() => setShowMore(s => !s)}
        className="mt-2 text-xs flex items-center gap-1 transition-colors"
        style={{ color: "var(--ink-muted)" }}
        onMouseEnter={e => (e.currentTarget.style.color = "var(--orange)")}
        onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-muted)")}
      >
        {showMore ? "Hide nutrients ↑" : "More nutrients ↓"}
      </button>

      {showMore && (
        <div className="mt-3 space-y-0">
          <NutrientReadout label="Sugar" value={dailyData?.total_sugar || 0} unit="g" />
          <NutrientReadout label="Cholesterol" value={dailyData?.total_cholesterol || 0} unit="mg" />
          <NutrientReadout label="Saturated Fat" value={dailyData?.total_saturated_fat || 0} unit="g" />
          <NutrientReadout label="Trans Fat" value={dailyData?.total_trans_fat || 0} unit="g" />
        </div>
      )}
    </div>
  );
}
```

**Step 2: Fix the call site in `Plan.tsx`**

`ProgressStats` now requires an `onSetGoalsClick` prop. Update the call in `Plan.tsx`:

```tsx
<ProgressStats
  dailyData={dailyData}
  goals={dailyData?.goals}
  onSetGoalsClick={() => setGoalModalOpen(true)}
/>
```

(The `setGoalModalOpen` state is added in Task 13.)

**Step 3: Commit**

```bash
git add src/components/plan/ProgressStats.tsx
git commit -m "feat: extend ProgressStats with fiber/sodium bars and expandable nutrient panel"
```

---

## Task 12: Build GoalSetupModal

**Files:**
- Create: `src/components/plan/GoalSetupModal.tsx`

**Step 1: Create `GoalSetupModal.tsx`**

```tsx
import { useState } from "react";
import { accountAPI, type SuggestedGoals } from "../../api/accountEndpoints";
import { planAPI } from "../../api/planEndpoints";

type GoalType = "maintain" | "lose" | "gain";
type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

interface GoalSetupModalProps {
  currentDate: Date;
  onClose: () => void;
  onSaved: () => void;
}

const GOAL_OPTIONS: { value: GoalType; label: string; desc: string }[] = [
  { value: "maintain", label: "Maintain Weight", desc: "Keep current weight steady" },
  { value: "lose", label: "Lose Weight", desc: "Moderate calorie deficit" },
  { value: "gain", label: "Gain Muscle", desc: "Slight calorie surplus" },
];

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; desc: string }[] = [
  { value: "sedentary", label: "Sedentary", desc: "Mostly sitting, little exercise" },
  { value: "light", label: "Lightly Active", desc: "Light exercise 1–3 days/week" },
  { value: "moderate", label: "Moderately Active", desc: "Moderate exercise 3–5 days/week" },
  { value: "active", label: "Very Active", desc: "Hard exercise 6–7 days/week" },
  { value: "very_active", label: "Extremely Active", desc: "Physical job + hard training" },
];

export default function GoalSetupModal({ currentDate, onClose, onSaved }: GoalSetupModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [goalType, setGoalType] = useState<GoalType>("maintain");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [suggested, setSuggested] = useState<SuggestedGoals | null>(null);
  const [editedGoals, setEditedGoals] = useState<SuggestedGoals | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      try {
        // Save goal_type + activity_level to profile first
        await accountAPI.updateProfile({ goal_type: goalType, activity_level: activityLevel });
        // Fetch suggestions
        const s = await accountAPI.suggestGoals();
        setSuggested(s);
        setEditedGoals({ ...s });
        setStep(3);
      } catch {
        setError("Failed to load suggestions. Please try again.");
      }
    }
  };

  const handleSave = async () => {
    if (!editedGoals) return;
    try {
      setSaving(true);
      const dateStr = currentDate.toISOString().split("T")[0];
      // Save default goals to profile
      await accountAPI.updateProfile({
        default_calorie_goal: editedGoals.calories,
        default_protein_goal: editedGoals.protein,
        default_carbs_goal: editedGoals.carbs,
        default_fat_goal: editedGoals.fat,
      });
      // Save to current week's plan
      await planAPI.updateGoals(dateStr, {
        daily_calorie_goal: editedGoals.calories,
        daily_protein_goal: editedGoals.protein,
        daily_carbs_goal: editedGoals.carbs,
        daily_fat_goal: editedGoals.fat,
        daily_fiber_goal: editedGoals.fiber,
        daily_sodium_goal: editedGoals.sodium,
      });
      onSaved();
      onClose();
    } catch {
      setError("Failed to save goals. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-lg p-6 sm:p-8"
        style={{ backgroundColor: "var(--warm-white)", maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display italic text-2xl" style={{ color: "var(--ink)" }}>
            {step === 1 ? "Your Goal" : step === 2 ? "Activity Level" : "Your Targets"}
          </h2>
          <button onClick={onClose} style={{ color: "var(--ink-muted)" }} aria-label="Close">✕</button>
        </div>

        {error && (
          <div className="mb-4 text-sm p-3 rounded" style={{ backgroundColor: "#fee2e2", color: "#b91c1c" }}>
            {error}
          </div>
        )}

        {/* Step 1: Goal type */}
        {step === 1 && (
          <div className="space-y-3">
            {GOAL_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setGoalType(opt.value)}
                className="w-full text-left p-4 rounded-lg border-2 transition-all"
                style={{
                  borderColor: goalType === opt.value ? "var(--orange)" : "var(--rule)",
                  backgroundColor: goalType === opt.value ? "var(--cream)" : "transparent",
                }}
              >
                <div className="font-display italic" style={{ color: "var(--ink)" }}>{opt.label}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--ink-muted)" }}>{opt.desc}</div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Activity level */}
        {step === 2 && (
          <div className="space-y-3">
            {ACTIVITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setActivityLevel(opt.value)}
                className="w-full text-left p-4 rounded-lg border-2 transition-all"
                style={{
                  borderColor: activityLevel === opt.value ? "var(--orange)" : "var(--rule)",
                  backgroundColor: activityLevel === opt.value ? "var(--cream)" : "transparent",
                }}
              >
                <div className="font-display italic" style={{ color: "var(--ink)" }}>{opt.label}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--ink-muted)" }}>{opt.desc}</div>
              </button>
            ))}
          </div>
        )}

        {/* Step 3: Review & edit targets */}
        {step === 3 && editedGoals && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
              Based on your choices. Edit any value, then save.
            </p>
            {(["calories", "protein", "carbs", "fat", "fiber", "sodium"] as const).map(key => (
              <div key={key}>
                <label className="text-xs uppercase tracking-widest block mb-1" style={{ color: "var(--ink-muted)", fontFamily: "'DM Sans', sans-serif" }}>
                  {key} {key === "sodium" ? "(mg)" : key === "calories" ? "(kcal)" : "(g)"}
                </label>
                <input
                  type="number"
                  value={editedGoals[key]}
                  onChange={e => setEditedGoals(g => g ? { ...g, [key]: Number(e.target.value) } : g)}
                  className="w-full px-3 py-2 rounded border font-mono-data text-sm"
                  style={{ borderColor: "var(--rule)", backgroundColor: "var(--cream)", color: "var(--ink)" }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Footer buttons */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button
              onClick={() => setStep(s => (s - 1) as 1 | 2 | 3)}
              className="flex-1 py-2 rounded border text-sm"
              style={{ borderColor: "var(--rule)", color: "var(--ink-muted)" }}
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={handleNext}
              className="flex-1 py-2 rounded text-sm font-medium"
              style={{ backgroundColor: "var(--orange)", color: "white" }}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2 rounded text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: "var(--orange)", color: "white" }}
            >
              {saving ? "Saving…" : "Save Goals"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Update `UpdateGoalsRequest` in `planEndpoints.ts`**

Add the new optional fields:

```typescript
export interface UpdateGoalsRequest {
  daily_calorie_goal?: number;
  daily_protein_goal?: number;
  daily_carbs_goal?: number;
  daily_fat_goal?: number;
  daily_fiber_goal?: number;
  daily_sodium_goal?: number;
}
```

**Step 3: Commit**

```bash
git add src/components/plan/GoalSetupModal.tsx src/api/planEndpoints.ts
git commit -m "feat: add GoalSetupModal with two-step guided goal setup"
```

---

## Task 13: Build CalorieTrend component

**Files:**
- Create: `src/components/plan/CalorieTrend.tsx`
- Create: `src/hooks/useCalorieTrend.ts`

**Step 1: Create `src/hooks/useCalorieTrend.ts`**

```typescript
import { useState, useEffect } from "react";
import { planAPI, type HistoryEntry } from "../api/planEndpoints";

export function useCalorieTrend(days: number) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    planAPI.getHistory(days)
      .then(data => setHistory(data.history))
      .catch(err => console.error("Failed to fetch calorie history:", err))
      .finally(() => setLoading(false));
  }, [days]);

  return { history, loading };
}
```

**Step 2: Create `src/components/plan/CalorieTrend.tsx`**

```tsx
import { useState, useMemo } from "react";
import { useCalorieTrend } from "../../hooks/useCalorieTrend";

interface CalorieTrendProps {
  calorieGoal: number | null;
}

function getBarColor(actual: number, goal: number): string {
  const pct = goal > 0 ? actual / goal : 0;
  if (pct >= 0.9) return "var(--amber)";
  if (pct >= 0.6) return "var(--orange)";
  return "var(--terracotta)";
}

export default function CalorieTrend({ calorieGoal }: CalorieTrendProps) {
  const [days, setDays] = useState<7 | 30>(30);
  const { history, loading } = useCalorieTrend(days);
  const goal = calorieGoal || 2000;

  // Compute 7-day rolling average
  const rollingAvg = useMemo(() => {
    return history.map((_, i) => {
      const window = history.slice(Math.max(0, i - 6), i + 1);
      return window.reduce((s, e) => s + e.total_calories, 0) / window.length;
    });
  }, [history]);

  const maxVal = Math.max(goal * 1.2, ...history.map(e => e.total_calories), 1);
  const barWidth = days === 7 ? 28 : 10;
  const svgWidth = history.length * (barWidth + 2);
  const svgHeight = 80;

  return (
    <div className="card-editorial p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs uppercase tracking-widest" style={{ color: "var(--ink-muted)", fontFamily: "'DM Sans', sans-serif" }}>
          Calorie Trend
        </p>
        <div className="flex gap-1">
          {([7, 30] as const).map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className="px-2 py-0.5 rounded text-xs font-mono-data transition-colors"
              style={{
                backgroundColor: days === d ? "var(--orange)" : "transparent",
                color: days === d ? "white" : "var(--ink-muted)",
                border: "1px solid var(--rule)",
              }}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-20 flex items-center justify-center" style={{ color: "var(--ink-muted)" }}>
          <span className="text-xs animate-pulse">Loading…</span>
        </div>
      ) : history.length === 0 ? (
        <div className="h-20 flex items-center justify-center" style={{ color: "var(--ink-muted)" }}>
          <span className="text-xs">No data yet. Start logging meals!</span>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <svg
            width={Math.max(svgWidth, 300)}
            height={svgHeight + 16}
            style={{ display: "block" }}
          >
            {/* Goal line */}
            <line
              x1={0}
              y1={svgHeight - (goal / maxVal) * svgHeight}
              x2={Math.max(svgWidth, 300)}
              y2={svgHeight - (goal / maxVal) * svgHeight}
              stroke="var(--orange)"
              strokeWidth={1}
              strokeDasharray="4 3"
              opacity={0.5}
            />

            {/* Bars */}
            {history.map((entry, i) => {
              const barH = Math.max(2, (entry.total_calories / maxVal) * svgHeight);
              const x = i * (barWidth + 2);
              return (
                <rect
                  key={entry.date}
                  x={x}
                  y={svgHeight - barH}
                  width={barWidth}
                  height={barH}
                  fill={getBarColor(entry.total_calories, goal)}
                  rx={2}
                  opacity={0.8}
                />
              );
            })}

            {/* Rolling average line */}
            {rollingAvg.length > 1 && (
              <polyline
                points={rollingAvg.map((avg, i) => {
                  const x = i * (barWidth + 2) + barWidth / 2;
                  const y = svgHeight - (avg / maxVal) * svgHeight;
                  return `${x},${y}`;
                }).join(" ")}
                fill="none"
                stroke="var(--ink)"
                strokeWidth={1.5}
                opacity={0.6}
              />
            )}

            {/* Date labels — first and last only */}
            {history.length > 0 && (
              <>
                <text x={0} y={svgHeight + 14} fontSize={9} fill="var(--ink-muted)" fontFamily="monospace">
                  {history[0].date.slice(5)}
                </text>
                <text
                  x={(history.length - 1) * (barWidth + 2)}
                  y={svgHeight + 14}
                  fontSize={9}
                  fill="var(--ink-muted)"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {history[history.length - 1].date.slice(5)}
                </text>
              </>
            )}
          </svg>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5" style={{ backgroundColor: "var(--orange)", borderTop: "1px dashed var(--orange)" }} />
          <span className="text-xs" style={{ color: "var(--ink-muted)" }}>Goal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5" style={{ backgroundColor: "var(--ink)", opacity: 0.6 }} />
          <span className="text-xs" style={{ color: "var(--ink-muted)" }}>7d avg</span>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/components/plan/CalorieTrend.tsx src/hooks/useCalorieTrend.ts
git commit -m "feat: add CalorieTrend component with 7/30-day bar chart and rolling average"
```

---

## Task 14: Wire up Plan.tsx

**Files:**
- Modify: `src/pages/Plan.tsx`

**Step 1: Update `Plan.tsx`**

Replace the full file:

```tsx
import { useState, useRef, useEffect } from "react";
import Navigation from "../components/common/Navigation";
import DailyMealPlan from "../components/plan/DailyMealPlan";
import WeeklyCalendar from "../components/plan/WeeklyCalendar";
import ProgressStats from "../components/plan/ProgressStats";
import GoalSetupModal from "../components/plan/GoalSetupModal";
import CalorieTrend from "../components/plan/CalorieTrend";
import { useWeekPlan } from "../hooks/usePlanData";
import { useDailyPlan } from "../hooks/useDailyPlan";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function getWeekDates(date: Date): Date[] {
  const week = [];
  const curr = new Date(date);
  const first = curr.getDate() - curr.getDay();
  for (let i = 0; i < 7; i++) {
    const day = new Date(curr.setDate(first + i));
    week.push(new Date(day));
  }
  return week;
}

export default function Plan() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/login", { replace: true });
  }, [user, navigate]);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState(getWeekDates(new Date()));
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const weeklyCalendarRef = useRef<HTMLDivElement>(null);

  const { data: weekData, loading: weekLoading, refetch: refetchWeek } = useWeekPlan(selectedDate);
  const {
    data: dailyData,
    loading: dailyLoading,
    updateItem,
    deleteItem,
    refetch: refetchDaily,
  } = useDailyPlan(selectedDate);

  useEffect(() => {
    setWeekDates(getWeekDates(selectedDate));
  }, [selectedDate]);

  // Auto-open goal modal if no goals set yet
  useEffect(() => {
    if (weekData && !weekData.daily_calorie_goal) {
      setGoalModalOpen(true);
    }
  }, [weekData]);

  const handleDateChange = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    setSelectedDate(newDate);
  };

  const handleWeekChange = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    setSelectedDate(newDate);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
      <Navigation />

      <div style={{ backgroundColor: "var(--orange-deep)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1
            className="font-display italic"
            style={{ fontSize: "clamp(3rem, 8vw, 6rem)", fontWeight: 300, color: "var(--cream-on-orange)" }}
          >
            Plan
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          {/* Left Column */}
          <div>
            <DailyMealPlan
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              dailyData={dailyData}
              loading={dailyLoading}
              onItemUpdated={updateItem}
              onItemDeleted={deleteItem}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <ProgressStats
              dailyData={dailyData}
              goals={dailyData?.goals}
              onSetGoalsClick={() => setGoalModalOpen(true)}
            />
            <WeeklyCalendar
              ref={weeklyCalendarRef}
              weekDates={weekDates}
              selectedDate={selectedDate}
              onDaySelect={setSelectedDate}
              onWeekChange={handleWeekChange}
              weekSummary={weekData?.week_summary}
            />
            <CalorieTrend calorieGoal={weekData?.daily_calorie_goal ?? null} />
          </div>
        </div>
      </div>

      {goalModalOpen && (
        <GoalSetupModal
          currentDate={selectedDate}
          onClose={() => setGoalModalOpen(false)}
          onSaved={() => {
            refetchWeek?.();
            refetchDaily?.();
          }}
        />
      )}
    </div>
  );
}
```

**Step 2: Add `refetch` to `useWeekPlan` and `useDailyPlan` hooks**

In `src/hooks/usePlanData.ts`, expose a `refetch` function:

```typescript
// Inside useWeekPlan, after defining fetchWeekPlan:
return { data, loading, error, refetch: fetchWeekPlan };
```

Do the same in `src/hooks/useDailyPlan.ts`:

```typescript
return { data, loading, updateItem, deleteItem, refetch: fetchDailyPlan };
```

(Move `fetchDailyPlan` out of the `useEffect` body so it's accessible to return — check the current hook structure and extract accordingly.)

**Step 3: Verify end-to-end in browser**

1. Open the Plan page — GoalSetupModal should auto-open since no goals are set
2. Complete the 3-step flow, verify goals appear in ProgressStats
3. Add a meal item, verify full nutrition shows in the expandable card panel
4. Verify Snack section appears
5. Verify CalorieTrend chart appears (may be empty until meals are logged across days)

**Step 4: Commit**

```bash
git add src/pages/Plan.tsx src/hooks/usePlanData.ts src/hooks/useDailyPlan.ts
git commit -m "feat: wire up GoalSetupModal, CalorieTrend, and updated ProgressStats in Plan page"
```

---

## Final: Run all backend tests

```bash
cd /Users/ishanajwani/Documents/HoosHungryBackend/HoosHungryBackend/hooshungrybackend
python manage.py test -v 2
```

Expected: All tests pass with no errors.
