# Focus Search

Chrome extension that turns `youtube.com` into a focused search screen and hides recommendation surfaces.

## Load In Chrome

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click `Load unpacked`.
4. Select this folder.
5. Open `https://www.youtube.com/`.

## Behavior

- The `youtube.com` home page becomes a centered search screen.
- Searches go to YouTube's normal results page.
- Search results remain usable.
- Recommendation surfaces such as the home feed, Shorts shelves, related videos, compact recommendations, comments, and end-screen recommendations are hidden.
- Click the Chrome toolbar icon to turn Focus Search on or off.

## Security And Privacy

- No analytics.
- No tracking.
- No external network requests.
- Uses a Manifest V3 service worker only for the toolbar on/off toggle.
- Uses `storage` only to save the local on/off setting.
- No access to non-YouTube pages.
- The extension only injects CSS and a content script on `youtube.com`.
- Search terms are sent only to YouTube's normal `/results?search_query=` URL.

## Chrome Web Store

- Store listing draft: [docs/STORE_LISTING.md](docs/STORE_LISTING.md)
- Privacy policy draft: [docs/PRIVACY.md](docs/PRIVACY.md)
- Build package: `scripts/build_store_package.sh`
- Upload package: `dist/focus-search-1.0.0.zip`

## Trademark Notice

This project is not affiliated with, endorsed by, or sponsored by YouTube or Google. YouTube is a trademark of Google LLC.

## License

MIT
