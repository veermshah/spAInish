# Transcripts Feature Setup

## Overview

The transcripts page displays all your conversation history with the AI tutor, including full transcripts and audio playback.

## Setup Instructions

### 1. Get your ElevenLabs API Key

1. Go to [ElevenLabs API Settings](https://elevenlabs.io/app/settings/api-keys)
2. Create a new API key or copy an existing one

### 2. Configure Environment Variables

1. Create a `.env.local` file in the root directory:

    ```bash
    cp .env.local.example .env.local
    ```

2. Add your ElevenLabs API key:
    ```
    ELEVENLABS_API_KEY=your_actual_api_key_here
    ```

### 3. Restart the Development Server

```bash
npm run dev
```

## Features

### Conversation List

-   **Expandable Rows**: Click on any conversation to expand and view the full transcript
-   **Auto-play Audio**: When you expand a conversation, the audio automatically starts playing
-   **Status Indicators**: Green check for successful conversations, red X for failed ones
-   **Rich Metadata**: See date, time, duration, message count, and agent name

### Transcript View

-   **Message Bubbles**: User messages on the right (blue), AI responses on the left (purple)
-   **Timestamps**: Each message shows when it occurred in the conversation
-   **Auto-scroll**: Scrollable transcript view with a max height

### Audio Playback

-   **Auto-play**: Audio starts when you expand a conversation
-   **Play/Pause Control**: Click the play/pause button to control audio
-   **Visual Indicator**: See which conversation is currently playing

### Statistics Dashboard

-   Total number of conversations
-   Number of successful calls
-   Total practice time in minutes

## API Endpoints

The feature uses three API endpoints:

1. **GET /api/conversations** - Fetches all conversations
2. **GET /api/conversations/[id]** - Fetches details for a specific conversation
3. **GET /api/conversations/[id]/audio** - Streams audio for a conversation

## Troubleshooting

### "Failed to fetch conversations" error

-   Make sure your `.env.local` file exists with a valid API key
-   Restart the development server after adding the API key
-   Check that the API key has the correct permissions

### Audio not playing

-   Check browser console for errors
-   Ensure the conversation has audio (`has_audio: true`)
-   Try clicking the play button manually

### Transcript not showing

-   Some conversations may not have transcripts if they failed
-   Check the conversation status - only "done" conversations have transcripts
