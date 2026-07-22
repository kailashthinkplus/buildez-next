export const CSS_POLICY = Object.freeze({
  allowedProperties: new Set([
    "backdrop-filter", "border-top-left-radius", "border-top-right-radius", "border-bottom-left-radius", "border-bottom-right-radius",
    "position", "top", "right", "bottom", "left", "content", "background", "background-image", "transform", "transition",
    "outline", "outline-offset", "clip-path", "mask-image", "filter", "opacity", "pointer-events", "z-index", "animation", "animation-delay", "box-sizing",
  ]),
  allowedSelectors: new Set(["selector", "selector::before", "selector::after", "selector:hover", "selector:focus-visible", "selector img", "selector:hover img", "selector:focus-visible img"]),
  allowedAtRules: new Set(["media", "keyframes"]),
  maxRules: 16,
  maxBytes: 4096,
  maxSpecificity: 2,
  maxAnimations: 1,
});
