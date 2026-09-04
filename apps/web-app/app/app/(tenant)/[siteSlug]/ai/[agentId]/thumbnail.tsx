import type { InsightAgentId } from "@/modules/insights/types";

export const AGENT_GRADIENTS: Record<InsightAgentId, [string, string]> = {
  "seo-agent": ["#1d4ed8", "#0e7490"],
  "geo-agent": ["#6d28d9", "#a21caf"],
  "speed-agent": ["#b45309", "#c2410c"],
  "accessibility-agent": ["#0e7490", "#1d4ed8"],
  "conversion-agent": ["#047857", "#0f766e"],
  "quality-agent": ["#be123c", "#be185d"],
  "business-agent": ["#4338ca", "#1d4ed8"],
  "marketing-agent": ["#be185d", "#c2410c"],
  "whatsapp-agent": ["#047857", "#15803d"],
  "chatbot-agent": ["#0369a1", "#4338ca"],
};

function Scene({ agentId }: { agentId: InsightAgentId }) {
  const stroke = "rgba(255,255,255,0.92)";
  const dim = "rgba(255,255,255,0.45)";
  switch (agentId) {
    case "seo-agent":
      return (
        <g>
          <rect x="30" y="24" width="70" height="52" rx="6" fill="none" stroke={dim} strokeWidth="2.5" />
          <circle cx="41" cy="34" r="2" fill={dim} />
          <circle cx="49" cy="34" r="2" fill={dim} />
          <line x1="38" y1="46" x2="80" y2="46" stroke={dim} strokeWidth="2" />
          <line x1="38" y1="56" x2="68" y2="56" stroke={dim} strokeWidth="2" />
          <circle cx="98" cy="72" r="16" fill="none" stroke={stroke} strokeWidth="4" />
          <line x1="109" y1="83" x2="122" y2="96" stroke={stroke} strokeWidth="5" strokeLinecap="round" />
        </g>
      );
    case "geo-agent":
      return (
        <g>
          <circle cx="80" cy="60" r="30" fill="none" stroke={stroke} strokeWidth="3" />
          <ellipse cx="80" cy="60" rx="30" ry="12" fill="none" stroke={dim} strokeWidth="2" />
          <ellipse cx="80" cy="60" rx="12" ry="30" fill="none" stroke={dim} strokeWidth="2" />
          <circle cx="122" cy="34" r="4" fill={stroke} />
          <circle cx="132" cy="56" r="3" fill={dim} />
          <circle cx="30" cy="82" r="3" fill={dim} />
        </g>
      );
    case "speed-agent":
      return (
        <g>
          <path d="M35 85 A45 45 0 0 1 125 85" fill="none" stroke={dim} strokeWidth="6" strokeLinecap="round" />
          <path d="M35 85 A45 45 0 0 1 95 45" fill="none" stroke={stroke} strokeWidth="6" strokeLinecap="round" />
          <line x1="80" y1="85" x2="102" y2="60" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
          <circle cx="80" cy="85" r="5" fill={stroke} />
        </g>
      );
    case "accessibility-agent":
      return (
        <g>
          <circle cx="70" cy="38" r="10" fill="none" stroke={stroke} strokeWidth="3.5" />
          <path d="M45 60 Q70 48 95 60 L88 92 M70 66 L70 92 M52 92 L58 66" fill="none" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="110" cy="82" r="15" fill="none" stroke={dim} strokeWidth="2.5" />
          <path d="M103 82 L108 88 L118 76" fill="none" stroke={dim} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    case "conversion-agent":
      return (
        <g>
          <rect x="34" y="70" width="14" height="24" rx="2" fill={dim} />
          <rect x="56" y="56" width="14" height="38" rx="2" fill={dim} />
          <rect x="78" y="38" width="14" height="56" rx="2" fill={stroke} />
          <path d="M100 60 L124 36 M124 36 L112 36 M124 36 L124 48" fill="none" stroke={stroke} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    case "quality-agent":
      return (
        <g>
          <path d="M80 26 L112 38 V64 C112 84 98 96 80 102 C62 96 48 84 48 64 V38 Z" fill="none" stroke={stroke} strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M65 64 L76 76 L98 52" fill="none" stroke={stroke} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    case "business-agent":
      return (
        <g>
          <rect x="44" y="52" width="12" height="30" fill={dim} />
          <rect x="62" y="40" width="12" height="42" fill={dim} />
          <rect x="80" y="58" width="12" height="24" fill={dim} />
          <rect x="52" y="30" width="36" height="20" rx="3" fill="none" stroke={stroke} strokeWidth="3.5" />
          <line x1="63" y1="30" x2="63" y2="24" stroke={stroke} strokeWidth="3.5" />
          <line x1="77" y1="30" x2="77" y2="24" stroke={stroke} strokeWidth="3.5" />
        </g>
      );
    case "marketing-agent":
      return (
        <g>
          <path d="M40 66 L70 52 V86 L40 72 Z" fill={dim} />
          <rect x="30" y="62" width="10" height="14" rx="2" fill={stroke} />
          <path d="M70 52 L104 40 V98 L70 86" fill="none" stroke={stroke} strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M114 55 Q122 62 114 69 M120 48 Q134 62 120 76" fill="none" stroke={dim} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );
    case "whatsapp-agent":
      return (
        <g>
          <path d="M40 40 H108 A8 8 0 0 1 116 48 V78 A8 8 0 0 1 108 86 H62 L44 100 V86 H40 A8 8 0 0 1 32 78 V48 A8 8 0 0 1 40 40 Z" fill="none" stroke={stroke} strokeWidth="3.5" strokeLinejoin="round" />
          <circle cx="60" cy="63" r="3.5" fill={stroke} />
          <circle cx="74" cy="63" r="3.5" fill={stroke} />
          <circle cx="88" cy="63" r="3.5" fill={stroke} />
        </g>
      );
    case "chatbot-agent":
      return (
        <g>
          <path d="M36 44 H104 A10 10 0 0 1 114 54 V80 A10 10 0 0 1 104 90 H64 L46 104 V90 H36 A10 10 0 0 1 26 80 V54 A10 10 0 0 1 36 44 Z" fill="none" stroke={stroke} strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M118 30 L122 40 L132 44 L122 48 L118 58 L114 48 L104 44 L114 40 Z" fill={stroke} />
        </g>
      );
    default:
      return null;
  }
}

export function agentGradientCss(agentId: InsightAgentId) {
  const [from, to] = AGENT_GRADIENTS[agentId];
  return `linear-gradient(135deg, ${from}, ${to})`;
}

// Fixed-size decorative icon — never stretched to fill a container.
// Use for cover-banner overlays; pair with agentGradientCss() for the background.
export function AgentIcon({ agentId, className }: { agentId: InsightAgentId; className?: string }) {
  return (
    <svg viewBox="0 0 160 120" className={className} role="img" aria-label="">
      <Scene agentId={agentId} />
    </svg>
  );
}

// Square/contained thumbnail (gradient + icon baked into one image) for use
// where the container's aspect ratio matches the 4:3 viewBox, e.g. list cards.
export function AgentThumbnail({ agentId, className }: { agentId: InsightAgentId; className?: string }) {
  const [from, to] = AGENT_GRADIENTS[agentId];
  const gradientId = `agent-thumb-${agentId}`;
  return (
    <svg viewBox="0 0 160 120" className={className} role="img" aria-label="">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="160" height="120" rx="18" fill={`url(#${gradientId})`} />
      <circle cx="140" cy="10" r="30" fill="rgba(255,255,255,0.08)" />
      <circle cx="10" cy="115" r="22" fill="rgba(255,255,255,0.06)" />
      <Scene agentId={agentId} />
    </svg>
  );
}
