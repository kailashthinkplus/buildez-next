import type { BuilderStyle } from "../../types/blueprint";

const TextDefaults = {
  props: {
    text: "Add clear supporting copy that explains the value of this section.",
  },

  style: {
    color: "theme.colors.textSecondary",
    fontFamily: "theme.typography.bodyFont",
    fontSize: { desktop: 16, mobile: 15 },
    fontWeight: 400,
    lineHeight: 1.7,
    textAlign: "left",
    marginBottom: 12,
    maxWidth: "68ch",
  } satisfies BuilderStyle,
};

export default TextDefaults;
