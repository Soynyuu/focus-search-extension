# YouTube Focus Search

Chrome extension that turns the YouTube home page into a focused YouTube-style search screen and hides recommendation surfaces across YouTube.

## Load In Chrome

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click `Load unpacked`.
4. Select this folder.
5. Open `https://www.youtube.com/`.

## Behavior

- The YouTube home page becomes a centered, YouTube-style search screen.
- Searches go to YouTube's normal results page.
- Search results remain usable.
- Recommendation surfaces such as the home feed, Shorts shelves, related videos, compact recommendations, and end-screen recommendations are hidden.

## Security And Privacy

- No analytics.
- No tracking.
- No external network requests.
- No background worker.
- No storage permission.
- No access to non-YouTube pages.
- The extension only injects CSS and a content script on `youtube.com`.
- Search terms are sent only to YouTube's normal `/results?search_query=` URL.

## License

MIT
