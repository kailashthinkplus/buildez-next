import type { BuilderStyle } from "../../types/blueprint";

const TextDefaults = {
  props: {
    text: "Lorem ipsum dolor sit amet.",
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
