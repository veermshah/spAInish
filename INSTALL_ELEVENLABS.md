# ⚠️ IMPORTANT: Install ElevenLabs SDK

## Required Installation

Before using the Memories feature, you MUST run this command:

```powershell
npm install @elevenlabs/elevenlabs-js
```

## Why?

The Memories page uses the ElevenLabs SDK to manage the knowledge base for your AI conversation partner. Without this package, the API routes won't work.

## After Installation

1. Run: `npm install @elevenlabs/elevenlabs-js`
2. Wait for installation to complete
3. Restart your development server if it's running
4. Visit `/memories` to start adding memories!

## Verify Installation

Check that the package is in your `package.json`:

```json
{
    "dependencies": {
        "@elevenlabs/elevenlabs-js": "^x.x.x"
    }
}
```

## If You See Errors

**"Cannot find module '@elevenlabs/elevenlabs-js'"**

-   Solution: Run `npm install @elevenlabs/elevenlabs-js`

**"Module not found: Can't resolve '@elevenlabs/elevenlabs-js'"**

-   Solution: Run `npm install @elevenlabs/elevenlabs-js` and restart dev server

---

Once installed, the Memories feature will work perfectly! 🎉
