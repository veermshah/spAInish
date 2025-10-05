# Activity Tracking System

This document explains how the activity tracking and streak system works in the application.

## Overview

The app tracks daily practice activity to encourage consistent learning. When a user practices Spanish (has a conversation), their activity is recorded for that day.

## Database Schema

### Profiles Table

-   `activity_dates`: An array of dates (DATE[]) when the user had practice activity
-   Stored in the `profiles` table in Supabase

### Database Functions

1. **`record_daily_activity(user_id UUID)`**

    - Adds today's date to the user's activity_dates array (if not already present)
    - Called automatically when a user starts a conversation

2. **`get_streak_count(user_id UUID)`**
    - Calculates the current streak (consecutive days of practice)
    - Returns 0 if no activity
    - Counts consecutive days up to today or yesterday

## How to Use

### Recording Activity

Activity is automatically recorded when:

1. User interacts with the practice widget on `/practice` page

You can also manually record activity by calling the API:

```javascript
await fetch("/api/activity", {
    method: "POST",
});
```

### Displaying Streaks on Dashboard

The dashboard automatically:

1. Fetches the user's profile including `activity_dates`
2. Calls `get_streak_count()` to get the current streak
3. Displays a 30-day calendar showing which days had activity
4. Highlights active days in the primary color

### Calendar Visualization

-   **Last 30 days** are displayed in a grid (10 columns)
-   **Active days** are highlighted in primary color
-   **Inactive days** are shown in muted color
-   **Today** has a ring indicator
-   Hover over any day to see the date and activity status

## Migration

Run the migration to add activity tracking:

```bash
# Apply the migration in Supabase
# This adds the activity_dates column and creates the necessary functions
```

The migration file is: `supabase/migrations/002_add_activity_tracking.sql`

## Future Enhancements

Potential improvements:

-   Add conversation count per day
-   Track practice duration
-   Add weekly/monthly goals
-   Send reminder notifications for inactive days
-   Export activity data
