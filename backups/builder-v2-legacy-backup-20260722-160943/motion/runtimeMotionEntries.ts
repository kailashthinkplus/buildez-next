import type { BuilderBlueprint } from "../types/blueprint";

export type RuntimeMotionEntry = {
  nodeId: string;
  engine: string;
  preset: string;
  duration: number;
  delay: number;
  ease: string;
  trigger: string;
  parallaxHorizontal: number;
  parallaxVertical: number;
  parallaxHorizontalDistance: number;
  parallaxVerticalDistance: number;
  parallaxHorizontalDirection: "left" | "right";
  parallaxVerticalDirection: "up" | "down";
  hoverTranslateY: number;
  hoverScale: number;
  hoverOpacity: number;
  pin: boolean;
  pinTop: number;
  mouseStrength: number;
};

export function buildRuntimeMotionEntries(
  blueprint: BuilderBlueprint
): RuntimeMotionEntry[] {
  return Object.values(blueprint.nodes).flatMap((node) => {
    const advanced = record(node.props?.advanced);
    const motion = record(advanced.motion);

    const legacyPreset =
      typeof node.props?.motionPreset === "string"
        ? node.props.motionPreset
        : "";

    const preset = String(
      motion.preset ?? legacyPreset ?? "none"
    );

    const horizontalSource = finite(
      motion.parallaxHorizontal,
      0
    );

    const verticalSource = finite(
      motion.parallaxVertical,
      finite(motion.parallaxSpeed, 0)
    );

    const horizontal = normalizeParallaxPercentage(
      horizontalSource
    );

    const vertical = normalizeParallaxPercentage(
      verticalSource
    );

    /*
     * New blueprints store explicit pixel distances.
     * Existing blueprints continue to use the older multiplier or
     * percentage properties and are converted at runtime.
     */
    const horizontalDistance =
      motion.parallaxHorizontalDistance !== undefined
        ? clamp(
            finite(motion.parallaxHorizontalDistance, 0),
            0,
            500
          )
        : legacyParallaxDistance(horizontalSource);

    const verticalDistance =
      motion.parallaxVerticalDistance !== undefined
        ? clamp(
            finite(motion.parallaxVerticalDistance, 0),
            0,
            500
          )
        : legacyParallaxDistance(verticalSource);

    const horizontalDirection =
      motion.parallaxHorizontalDirection === "right"
        ? "right"
        : motion.parallaxHorizontalDirection === "left"
          ? "left"
          : horizontalSource < 0
            ? "right"
            : "left";

    const verticalDirection =
      motion.parallaxVerticalDirection === "down"
        ? "down"
        : motion.parallaxVerticalDirection === "up"
          ? "up"
          : verticalSource < 0
            ? "down"
            : "up";

    const pin =
      preset === "pin" ||
      motion.pin === true;

    const hasRuntimeEffect =
      preset !== "none" ||
      horizontal !== 0 ||
      vertical !== 0 ||
      horizontalDistance !== 0 ||
      verticalDistance !== 0 ||
      finite(motion.hoverTranslateY, 0) !== 0 ||
      finite(motion.hoverScale, 1) !== 1 ||
      finite(motion.mouseStrength, 0) !== 0 ||
      pin;

    if (
      !hasRuntimeEffect ||
      motion.engine === "none"
    ) {
      return [];
    }

    return [
      {
        nodeId: node.id,
        engine: String(
          motion.engine ??
            (preset === "parallax"
              ? "parallax"
              : "css")
        ),
        preset,
        duration: finite(motion.duration, 0.6),
        delay: finite(motion.delay, 0),
        ease: normalizeEase(
          String(motion.ease ?? "ease")
        ),
        trigger: String(
          motion.trigger ?? "viewport"
        ),
        parallaxHorizontal: horizontal,
        parallaxVertical: vertical,
        parallaxHorizontalDistance: horizontalDistance,
        parallaxVerticalDistance: verticalDistance,
        parallaxHorizontalDirection:
          horizontalDirection,
        parallaxVerticalDirection:
          verticalDirection,
        hoverTranslateY: finite(
          motion.hoverTranslateY,
          0
        ),
        hoverScale: finite(
          motion.hoverScale,
          1
        ),
        hoverOpacity: finite(
          motion.hoverOpacity,
          1
        ),
        pin,
        pinTop: finite(
          motion.pinTop,
          0
        ),
        mouseStrength: finite(
          motion.mouseStrength,
          0
        ),
      },
    ];
  });
}

function legacyParallaxDistance(
  value: number
): number {
  if (!Number.isFinite(value) || value === 0) {
    return 0;
  }

  const magnitude = Math.abs(value);

  /*
   * Original BuildEZ format: approximately 0–2 multipliers.
   * A value of 1 produced about 120px of displacement.
   */
  if (magnitude <= 2) {
    return clamp(magnitude * 120, 0, 500);
  }

  /*
   * Intermediate percentage format: 0–100%.
   * Preserve its previous 100% ≈ 160px behavior.
   */
  if (magnitude <= 100) {
    return clamp(magnitude * 1.6, 0, 500);
  }

  return clamp(magnitude, 0, 500);
}

function normalizeParallaxPercentage(
  value: number
): number {
  if (value === 0) {
    return 0;
  }

  /*
   * Legacy values used approximately -2 to 2.
   * New values use 0 to 100%.
   */
  if (Math.abs(value) <= 2) {
    return clamp(
      Math.abs(value) * 50,
      0,
      100
    );
  }

  return clamp(
    Math.abs(value),
    0,
    100
  );
}

function record(
  value: unknown
): Record<string, unknown> {
  return value &&
    typeof value === "object" &&
    !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function finite(
  value: unknown,
  fallback: number
): number {
  const next = Number(value);

  return Number.isFinite(next)
    ? next
    : fallback;
}

function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.min(
    max,
    Math.max(min, value)
  );
}

function normalizeEase(
  value: string
): string {
  const aliases: Record<string, string> = {
    "power2.out":
      "cubic-bezier(.22,1,.36,1)",
    "power3.inOut":
      "cubic-bezier(.65,0,.35,1)",
    "back.out":
      "cubic-bezier(.34,1.56,.64,1)",
    "elastic.out":
      "cubic-bezier(.2,1.6,.4,1)",
  };

  return aliases[value] ?? value;
}
