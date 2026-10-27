import { isBuiltinSpriteId, sheetUrl } from "@/lib/sprites";
import type { BuiltinSpriteId, SpriteAnim, SpriteId } from "@/lib/types";

export function PlantSprite({
  spriteId,
  anim,
  label,
  hue = 0,
  sheet,
}: {
  spriteId: SpriteId;
  anim: SpriteAnim;
  label: string;
  hue?: number;
  sheet?: BuiltinSpriteId;
}) {
  const source = sheet ?? (isBuiltinSpriteId(spriteId) ? spriteId : "original");
  const visual: SpriteAnim = anim === "block" && source === "white" ? "idle" : anim;

  return (
    <div
      role="img"
      aria-label={label}
      className={`plant-sprite plant-sprite--${visual}`}
      style={{
        backgroundImage: `url(${sheetUrl(source, visual)})`,
        filter: hue ? `hue-rotate(${hue}deg) saturate(1.25)` : undefined,
      }}
    />
  );
}
