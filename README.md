# Browser Controller Extension

A Chrome extension that demonstrates the use of the Chrome Debugger API with a side panel interface.

## Features

- **Debugger Control**: Attach and detach the Chrome debugger to/from tabs
- **Smart UI State Management**: All controls are disabled until debugger is attached (except "Attach Debugger" button)
- **Automatic Tab Switching**: When debugger is attached and you switch tabs, it automatically moves the debugger to the new tab
- **Navigation**: Navigate to URLs programmatically
- **Screenshots**: Capture page screenshots
- **Page Interaction**: Get page title and content
- **Script Execution**: Execute custom JavaScript on pages
- **Console Integration**: View console logs from the debugged page

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select this folder (`debugger-example-extension`)
5. The extension should now appear in your extensions list

## Usage

1. **Open the Side Panel**: Click the extension icon in the toolbar to open the side panel
2. **Attach Debugger**: Click "Attach Debugger" to enable debugger functionality for the current tab
   - All other controls will be grayed out until debugger is attached
   - When you switch tabs, the debugger will automatically move to the new tab
3. **Test Features**: Once attached, use the various buttons to test different debugger API capabilities

## Testing the Debugger API

### Basic Testing:

1. Navigate to any webpage (e.g., `https://example.com`)
2. Open the extension side panel
3. Click "Attach Debugger" (notice how other controls become enabled)
4. Try the various features:
   - Take a screenshot
   - Get the page title
   - Navigate to a new URL
   - Get page content

### Advanced Testing:

1. Use "Execute Custom Script" to run JavaScript like:
   - `document.body.style.background = 'red'`
   - `alert('Hello from debugger!')`
   - `console.log('Debugger test')`
2. Use "Get Console Logs" to see console output from the page
3. Test tab switching: switch to another tab and notice the debugger automatically follows
3. Test the link dropdown on different sites to see intelligent filtering in action

## Files Overview

- `manifest.json` - Extension configuration with debugger permissions
- `sidepanel.html` - Side panel UI with improved styling
- `sidepanel.js` - Main logic for debugger API interactions
- `background.js` - Service worker for background tasks and event handling

## Permissions Used

- `debugger` - Core permission for debugger API access
- `tabs` - Access to tab information
- `activeTab` - Access to active tab without broad permissions
- `sidePanel` - Enable side panel functionality

## Notes

- The debugger can only be attached to one extension at a time per tab
- Some websites may have restrictions that limit debugger functionality
- The extension includes error handling and status updates for better UX
- Icons are referenced in manifest.json but not included (see icons-readme.txt)

## Debugging

- Check the extension's service worker console in `chrome://extensions/`
- Use the browser's developer tools to inspect the side panel
- Console logs from the extension appear in the background service worker console
