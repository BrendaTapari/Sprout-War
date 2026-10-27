import { sheetUrl } from "@/lib/sprites";
import type { SpriteAnim, SpriteId } from "@/lib/types";

export function PlantSprite({
  spriteId,
  anim,
  label,
}: {
  spriteId: SpriteId;
  anim: SpriteAnim;
  label: string;
}) {
  const visual: SpriteAnim = anim === "block" && spriteId === "white" ? "idle" : anim;

  return (
    <div
      role="img"
      aria-label={label}
      className={`plant-sprite plant-sprite--${visual}`}
      style={{ backgroundImage: `url(${sheetUrl(spriteId, visual)})` }}
    />
  );
}
