# Security Policy

## Supported Versions

Security fixes are considered for the latest version in `main`.

## Reporting A Vulnerability

Please open a GitHub issue with a clear description of the issue, affected files, reproduction steps, and potential impact.

## Privacy Model

Focus Search does not collect, transmit, sell, or analyze user data.

The extension stores only one local setting: whether Focus Search is on or off. This setting is saved with `chrome.storage.local` and never leaves the user's browser.

The extension has no external network requests. It uses a Manifest V3 service worker only to handle the toolbar on/off toggle. It only runs a content script on YouTube pages and redirects search submissions to YouTube's normal search results URL.
