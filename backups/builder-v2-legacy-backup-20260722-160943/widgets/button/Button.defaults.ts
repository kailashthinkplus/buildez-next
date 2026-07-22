const ButtonDefaults = {
  props: {
    text: "Get started",
    url: "#",
    variant: "primary",
    size: "md",
    fullWidth: false,
  },

  style: {
    backgroundColor: "theme.buttons.primary.backgroundColor",
    color: "theme.buttons.primary.color",
    borderRadius: "theme.buttons.primary.borderRadius",
    paddingX: 24,
    paddingY: 14,
    fontSize: 16,
    fontWeight: 600,
    lineHeight: 1.2,
    minHeight: 48,
    boxShadow: "theme.shadow.card",
    transition: "background-color 160ms ease, color 160ms ease, transform 160ms ease, box-shadow 160ms ease",
  },
};

export default ButtonDefaults;
