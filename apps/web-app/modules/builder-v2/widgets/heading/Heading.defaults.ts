import type { BuilderStyle } from "../../types/blueprint";

const HeadingDefaults = {
  props: {
    text: "A clear headline that communicates real value",
    level: "h2",
  },

  style: {
    color: "theme.colors.textPrimary",
    fontFamily: "theme.typography.headingFont",
    fontSize: { desktop: 40, tablet: 34, mobile: 30 },
    fontWeight: 700,
    lineHeight: 1.2,
    textAlign: "left",
    letterSpacing: -0.02,
    marginBottom: 12,
  } satisfies BuilderStyle,
};

export default HeadingDefaults;
