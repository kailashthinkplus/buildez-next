# Architecture

Canonical files remain in `V12ProjectFile`. Preview materialization produces an ephemeral copy and injects Builder-only TSX attributes there. Selection messages carry project-relative files and syntax anchors. Inspector/inline edits resolve the anchor against canonical TSX, create a workspace revision, and restart the Vite preview. Published source never receives overlay code or `data-buildez-*` attributes.

The bridge is versioned and session-scoped. The shell checks iframe window and preview origin; the runtime checks parent window and referrer origin. Unknown types and stale sessions are rejected.
