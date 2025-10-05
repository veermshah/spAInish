# Memories Feature - AI Knowledge Base Management ✨

## Overview

The Memories page allows you to manage the knowledge base for your ElevenLabs AI conversation partner. Add personal information, preferences, and context to make your Spanish practice conversations more personalized and effective!

## 🚀 What's Been Created

### 1. **New Memories Page** (`/memories`)
   - Beautiful, user-friendly interface for managing AI memories
   - Located at: `src/app/memories/page.tsx`

### 2. **API Route for Knowledge Base** (`/api/knowledge-base`)
   - Handles all ElevenLabs knowledge base operations
   - Located at: `src/app/api/knowledge-base/route.ts`
   - **Important**: Requires `elevenlabs` npm package

### 3. **Updated Navbar**
   - Added "Memories" link between Analytics and Transcripts
   - Located at: `src/components/Navbar.tsx`

## 📦 Installation Required

**Before using this feature, you MUST install the ElevenLabs SDK:**

```powershell
npm install @elevenlabs/elevenlabs-js
```

This package is required for the API route to work properly.

## 🎯 Features

### View All Memories
- See all stored knowledge base documents
- Shows document name and ID
- Real-time list updates
- Refresh button to reload

### Add New Memories
- Large text area for entering information
- Examples provided for guidance
- Instant feedback on success/failure
- Auto-clears form after successful add

### Delete Memories
- Delete button on each memory
- Confirmation dialog for safety
- Instant removal from list
- Error handling for missing documents

### Smart UI
- **Loading states** - Shows spinners during operations
- **Error messages** - Clear red alerts for problems
- **Success messages** - Green alerts for confirmations
- **Empty state** - Friendly message when no memories exist
- **Info card** - Helpful tips on how to use memories

## 💡 How to Use

### Adding a Memory

1. Go to the **Memories** page from the navbar
2. Type or paste text in the "Memory Text" area
3. Click **"Add Memory"**
4. The AI will now remember this information!

### What to Add

**Good Examples:**
- "My name is Sarah and I'm 25 years old. I work as a teacher."
- "I'm learning Spanish to communicate with my in-laws in Mexico."
- "I prefer slow-paced conversations and need help with pronunciation."
- "I love cooking and want to learn food-related vocabulary."
- "I'm planning a trip to Barcelona next summer."

**Categories to Consider:**
- Personal details (name, age, profession)
- Learning goals and motivations
- Preferred learning style
- Interests and hobbies
- Travel plans
- Cultural preferences
- Difficulty areas
- Topics you enjoy

### Deleting a Memory

1. Find the memory in the list
2. Click the **"Delete"** button
3. Confirm the deletion
4. Memory is removed permanently

## 🔧 Technical Details

### API Endpoints

**GET `/api/knowledge-base`**
- Lists all knowledge base documents
- Returns: `{ documents: [], next_cursor: null, has_more: false }`

**POST `/api/knowledge-base`**
- Creates a new document from text
- Body: `{ text: "your memory text" }`
- Returns: `{ id: "doc_id", name: "Text document" }`

**DELETE `/api/knowledge-base?id=<document_id>`**
- Deletes a specific document
- Returns: `{ success: true }` or error

### Environment Variables

Make sure you have this set in your `.env.local`:

```
ELEVENLABS_API_KEY=your_api_key_here
```

### Type Definitions

```typescript
type KnowledgeDocument = {
    id: string;
    name: string;
};

type KnowledgeBaseResponse = {
    documents: KnowledgeDocument[];
    next_cursor: string | null;
    has_more: boolean;
};
```

## 🎨 UI Components Used

- **Card/CardHeader/CardContent** - Layout structure
- **Button** - Actions (add, delete, refresh)
- **Textarea** - Memory input
- **Icons** - Brain, Plus, Trash2, FileText, RefreshCw, Loader2
- **Color Coding**:
  - Red borders/text for errors
  - Green borders/text for success
  - Blue for informational content

## 🔐 Privacy & Security

- Memories are stored in your **ElevenLabs account**
- Only accessible to you and your AI partner
- Not shared with other users
- Can be deleted at any time
- Controlled by ElevenLabs API authentication

## 🚨 Error Handling

The page handles these scenarios:
- API connection failures
- Invalid input (empty text)
- Document not found errors
- Network timeouts
- Missing API keys

All errors show user-friendly messages in red alert cards.

## 📱 Responsive Design

- Works on all screen sizes
- Mobile-friendly layout
- Touch-optimized buttons
- Scrollable text areas

## 🔄 State Management

- React hooks for state (useState, useEffect)
- Loading states prevent double-clicks
- Optimistic UI updates
- Auto-refresh after mutations

## 🎯 Next Steps

1. **Install the package**: `npm install @elevenlabs/elevenlabs-js`
2. **Verify API key** is set in environment variables
3. **Visit** `/memories` page
4. **Add your first memory** to personalize the AI!
5. **Test the Practice page** to see how memories improve conversations

## 🐛 Troubleshooting

**"Cannot find module '@elevenlabs/elevenlabs-js'"**
- Run: `npm install @elevenlabs/elevenlabs-js`

**"Failed to fetch knowledge base documents"**
- Check that `ELEVENLABS_API_KEY` is set
- Verify the API key is valid
- Check network connection

**"Document not found" when deleting**
- Document may have already been deleted
- Refresh the list to see current state

**Empty list but you added memories**
- Click the refresh button
- Check browser console for errors
- Verify API key permissions

## 📚 Related Documentation

- [ElevenLabs Conversational AI Docs](https://elevenlabs.io/docs/conversational-ai/docs/overview)
- [Knowledge Base API Reference](https://elevenlabs.io/docs/api-reference/knowledge-base)

---

**Built with**: Next.js 14, React, TypeScript, ElevenLabs SDK, shadcn/ui components
**Status**: ✅ Ready to use after `npm install elevenlabs`
