# Source mapping

Intrinsic JSX elements receive a stable ID derived from project-relative file plus syntax-tree path. Ordinary text and class changes preserve identity. The source anchor is the opening element offset and is deliberately validated on every mutation. A stale anchor fails closed; it never falls back to global text replacement.

Supported committed patches in this slice: direct JSX text and string attributes `className`, `src`, `alt`, `href`, and `id`.
