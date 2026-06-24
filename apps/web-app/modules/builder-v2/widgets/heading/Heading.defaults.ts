import type { BuilderStyle } from "../../types/blueprint";

const HeadingDefaults = {
  props: {
    text: "Your Heading",
    level: "h2",
  },

  style: {
    color: "text.primary",
    fontSize: 48,
    fontWeight: 700,
    lineHeight: 1.2,
    textAlign: "left",
    marginBottom: 16,
  } satisfies BuilderStyle,
};

export default HeadingDefaults;
