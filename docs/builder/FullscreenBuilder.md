# Fullscreen Builder

Date: 2026-07-09  
Phase: BSP-14  
Status: Implemented with browser API fallback

## Behavior

BSP-14 adds fullscreen/focus mode support to the Builder workspace.

Supported:

- Fullscreen toggle.
- Browser fullscreen request where supported.
- Builder focus mode.
- Sidebar and inspector collapse in focus mode.
- Header hidden in focus mode.
- Escape exits fullscreen/focus mode.
- Preference persisted in local storage.

## Notes

Browsers require a user gesture for true fullscreen. When browser fullscreen is not available or rejected, Builder focus mode still applies inside the workspace.

Preference key:

`buildez.builder.fullscreen.focus`

## Remaining Work

- Browser automation proof across Chrome/Safari/Firefox.
- Mobile/tablet fullscreen behavior QA.
- Explicit keyboard shortcut registry integration.
