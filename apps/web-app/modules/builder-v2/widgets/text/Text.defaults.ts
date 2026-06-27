import type { BuilderStyle } from "../../types/blueprint";

const TextDefaults = {
  props: {
    text: "Add clear supporting copy that explains the value of this section.",
  },

  style: {
    color: "text.secondary",
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 1.7,
    textAlign: "left",
    marginBottom: 16,
  } satisfies BuilderStyle,
};

export default TextDefaults;
