// Design styles define HOW to use brand colors, not WHAT colors

export interface DesignStyle {
  name: string;
  description: string;
  
  // Typography - relative to brand
  typography: {
    headingFont: "serif" | "sans-serif" | "display";
    bodyFont: "sans-serif" | "serif";
    scale: "compact" | "normal" | "generous"; // size multiplier
    weight: "light" | "normal" | "bold"; // heading weight
    lineHeight: "tight" | "normal" | "relaxed";
  };
  
  // Spacing - relative values
  spacing: {
    density: "tight" | "normal" | "spacious"; // affects all spacing
    sectionPadding: number; // px
    elementGap: number; // px
  };
  
  // Visual effects
  effects: {
    buttonStyle: "sharp" | "rounded" | "pill";
    cardStyle: "flat" | "elevated" | "outlined" | "glass";
    imageStyle: "sharp" | "rounded" | "circular";
    shadows: "none" | "subtle" | "prominent";
  };
  
  // Color usage rules (HOW to use brand colors)
  colorUsage: {
    // Hero section
    hero: {
      background: "gradient-primary" | "gradient-subtle" | "solid-background" | "image";
      textColor: "primary" | "contrast";
      accentUsage: "buttons" | "decorative" | "none";
    };
    // Sections
    sections: {
      alternateBackgrounds: boolean;
      lightSectionBg: "white" | "surface" | "subtle-tint";
    };
    // Components
    buttons: {
      primary: "brand-primary" | "brand-accent" | "dark";
      style: "filled" | "outlined" | "ghost";
    };
    cards: {
      background: "white" | "surface" | "tinted";
      border: boolean;
    };
  };
}

export const DESIGN_STYLES: Record<string, DesignStyle> = {
  // 1. EDITORIAL (like Lovable - sophisticated, serif headings)
  editorial: {
    name: "Editorial",
    description: "Sophisticated, magazine-inspired design with serif headings",
    
    typography: {
      headingFont: "serif",
      bodyFont: "sans-serif",
      scale: "generous",
      weight: "normal",
      lineHeight: "relaxed",
    },
    
    spacing: {
      density: "spacious",
      sectionPadding: 120,
      elementGap: 24,
    },
    
    effects: {
      buttonStyle: "rounded",
      cardStyle: "flat",
      imageStyle: "rounded",
      shadows: "subtle",
    },
    
    colorUsage: {
      hero: {
        background: "solid-background",
        textColor: "primary",
        accentUsage: "buttons",
      },
      sections: {
        alternateBackgrounds: true,
        lightSectionBg: "white",
      },
      buttons: {
        primary: "brand-accent",
        style: "filled",
      },
      cards: {
        background: "white",
        border: true,
      },
    },
  },

  // 2. MODERN MINIMAL
  modernMinimal: {
    name: "Modern Minimal",
    description: "Clean, contemporary design with sans-serif typography",
    
    typography: {
      headingFont: "sans-serif",
      bodyFont: "sans-serif",
      scale: "normal",
      weight: "bold",
      lineHeight: "normal",
    },
    
    spacing: {
      density: "normal",
      sectionPadding: 96,
      elementGap: 20,
    },
    
    effects: {
      buttonStyle: "rounded",
      cardStyle: "elevated",
      imageStyle: "rounded",
      shadows: "prominent",
    },
    
    colorUsage: {
      hero: {
        background: "gradient-subtle",
        textColor: "primary",
        accentUsage: "buttons",
      },
      sections: {
        alternateBackgrounds: true,
        lightSectionBg: "surface",
      },
      buttons: {
        primary: "brand-primary",
        style: "filled",
      },
      cards: {
        background: "white",
        border: false,
      },
    },
  },

  // 3. ELEGANT LUXURY
  elegantLuxury: {
    name: "Elegant Luxury",
    description: "Refined, high-end design with generous spacing",
    
    typography: {
      headingFont: "serif",
      bodyFont: "serif",
      scale: "generous",
      weight: "light",
      lineHeight: "relaxed",
    },
    
    spacing: {
      density: "spacious",
      sectionPadding: 140,
      elementGap: 32,
    },
    
    effects: {
      buttonStyle: "sharp",
      cardStyle: "outlined",
      imageStyle: "sharp",
      shadows: "none",
    },
    
    colorUsage: {
      hero: {
        background: "image",
        textColor: "contrast",
        accentUsage: "decorative",
      },
      sections: {
        alternateBackgrounds: false,
        lightSectionBg: "white",
      },
      buttons: {
        primary: "dark",
        style: "outlined",
      },
      cards: {
        background: "white",
        border: true,
      },
    },
  },

  // 4. TECH FORWARD
  techForward: {
    name: "Tech Forward",
    description: "Bold, futuristic design with strong brand colors",
    
    typography: {
      headingFont: "sans-serif",
      bodyFont: "sans-serif",
      scale: "normal",
      weight: "bold",
      lineHeight: "normal",
    },
    
    spacing: {
      density: "normal",
      sectionPadding: 100,
      elementGap: 20,
    },
    
    effects: {
      buttonStyle: "rounded",
      cardStyle: "glass",
      imageStyle: "rounded",
      shadows: "prominent",
    },
    
    colorUsage: {
      hero: {
        background: "gradient-primary",
        textColor: "contrast",
        accentUsage: "decorative",
      },
      sections: {
        alternateBackgrounds: true,
        lightSectionBg: "surface",
      },
      buttons: {
        primary: "brand-accent",
        style: "filled",
      },
      cards: {
        background: "tinted",
        border: false,
      },
    },
  },

  // 5. BOLD IMPACT
  boldImpact: {
    name: "Bold Impact",
    description: "High-energy design with strong visual presence",
    
    typography: {
      headingFont: "display",
      bodyFont: "sans-serif",
      scale: "generous",
      weight: "bold",
      lineHeight: "tight",
    },
    
    spacing: {
      density: "tight",
      sectionPadding: 80,
      elementGap: 16,
    },
    
    effects: {
      buttonStyle: "pill",
      cardStyle: "elevated",
      imageStyle: "rounded",
      shadows: "prominent",
    },
    
    colorUsage: {
      hero: {
        background: "gradient-primary",
        textColor: "contrast",
        accentUsage: "buttons",
      },
      sections: {
        alternateBackgrounds: true,
        lightSectionBg: "subtle-tint",
      },
      buttons: {
        primary: "brand-primary",
        style: "filled",
      },
      cards: {
        background: "white",
        border: false,
      },
    },
  },

  // 6. CLEAN CORPORATE
  cleanCorporate: {
    name: "Clean Corporate",
    description: "Professional, trustworthy design for business",
    
    typography: {
      headingFont: "sans-serif",
      bodyFont: "sans-serif",
      scale: "normal",
      weight: "normal",
      lineHeight: "normal",
    },
    
    spacing: {
      density: "normal",
      sectionPadding: 96,
      elementGap: 20,
    },
    
    effects: {
      buttonStyle: "rounded",
      cardStyle: "outlined",
      imageStyle: "rounded",
      shadows: "subtle",
    },
    
    colorUsage: {
      hero: {
        background: "gradient-subtle",
        textColor: "primary",
        accentUsage: "buttons",
      },
      sections: {
        alternateBackgrounds: true,
        lightSectionBg: "surface",
      },
      buttons: {
        primary: "brand-primary",
        style: "filled",
      },
      cards: {
        background: "white",
        border: true,
      },
    },
  },
};

// Font mappings (Google Fonts)
export const FONT_MAPPINGS = {
  serif: {
    elegant: "'Playfair Display', Georgia, serif",
    classic: "'Merriweather', Georgia, serif",
    modern: "'Cormorant Garamond', Georgia, serif",
  },
  "sans-serif": {
    modern: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    friendly: "'DM Sans', -apple-system, sans-serif",
    professional: "'Manrope', -apple-system, sans-serif",
  },
  display: {
    bold: "'Poppins', -apple-system, sans-serif",
    tech: "'Space Grotesk', -apple-system, sans-serif",
    creative: "'Outfit', -apple-system, sans-serif",
  },
};

// Typography scale multipliers
export const SCALE_MULTIPLIERS = {
  compact: 0.85,
  normal: 1.0,
  generous: 1.15,
};

// Select design style based on business type and tone
export function selectDesignStyle(businessType: string, tone?: string): string {
  const lower = businessType.toLowerCase();
  const toneStr = (tone || "").toLowerCase();
  
  // Real estate, construction
  if (lower.includes("real estate") || lower.includes("construction") || lower.includes("property")) {
    if (toneStr.includes("luxury") || toneStr.includes("premium")) return "elegantLuxury";
    if (toneStr.includes("modern")) return "modernMinimal";
    return "cleanCorporate";
  }
  
  // Tech, SaaS
  if (lower.includes("tech") || lower.includes("saas") || lower.includes("software")) {
    return "techForward";
  }
  
  // Creative, agency
  if (lower.includes("agency") || lower.includes("creative") || lower.includes("design")) {
    return "boldImpact";
  }
  
  // Professional services
  if (lower.includes("consulting") || lower.includes("legal") || lower.includes("financial")) {
    return "cleanCorporate";
  }
  
  // Lifestyle, fashion, editorial
  if (lower.includes("fashion") || lower.includes("lifestyle") || lower.includes("magazine")) {
    return "editorial";
  }
  
  // Default
  return "modernMinimal";
}
