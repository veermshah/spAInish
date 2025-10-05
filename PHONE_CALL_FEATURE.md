# Phone Call Practice Feature

This feature allows users to practice Spanish through phone calls initiated by the ElevenLabs AI agent.

## Setup

### Environment Variables

Add the following to your `.env.local` file:

```env
ELEVENLABS_API_KEY=your_api_key_here
ELEVENLABS_PHONE_NUMBER_ID=your_phone_number_id_here
```

You can find these values in your ElevenLabs dashboard.

## Features

### 1. Call Now

-   Immediately initiates a phone call to the user's registered phone number
-   Uses the phone number from the user's profile in Supabase
-   Displays the phone number that will be called
-   Shows error if no phone number is set in profile

### 2. Schedule Recurring Calls

-   Set up recurring practice calls
-   Options:
    -   **Daily**: Every day
    -   **Weekdays Only**: Monday-Friday
    -   **Weekly**: Once per week
    -   **Bi-weekly**: Every two weeks
-   Choose preferred time for calls
-   _Note: Scheduling logic needs to be implemented with a cron job or scheduling service_

## API Endpoint

### POST `/api/call`

Initiates an outbound call using ElevenLabs Twilio integration.

**Authentication**: Required (user must be logged in)

**Response**:

```json
{
    "success": true,
    "message": "Call initiated",
    "data": {
        /* ElevenLabs response */
    }
}
```

**Error Responses**:

-   `401`: User not authenticated
-   `400`: Phone number not found in profile
-   `500`: Call initiation failed

## How It Works

1. User clicks "Call Me Now" button
2. Frontend calls `/api/call` endpoint
3. Backend:
    - Authenticates user
    - Fetches user's phone number from Supabase profiles table
    - Calls ElevenLabs API to initiate outbound call
4. User receives phone call from AI agent
5. Activity is recorded for streak tracking

## Future Enhancements

### Implement Call Scheduling

To implement recurring calls, you could use:

-   **Vercel Cron Jobs** (for Vercel deployments)
-   **AWS EventBridge** or **CloudWatch Events**
-   **Google Cloud Scheduler**
-   **Third-party services** like Zapier or Make

Example implementation:

```typescript
// Create a scheduled API route that runs daily
// Check users who have scheduled calls at current time
// Call ElevenLabs API for each user
```

### Additional Features

-   Call history tracking
-   Ability to pause/resume scheduled calls
-   Multiple time slots per day
-   Weekend vs weekday preferences
-   Timezone support
-   Call duration preferences
