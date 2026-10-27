/**
 * Tiro base: Math.random() * ataque.
 * La defensa atenúa el golpe para que el stat se note, con un piso para que la pelea avance.
 * Un bloqueo deja solo una parte del daño.
 */
export function rollDamage(attack: number, defense: number, blocked = false): number {
  const raw = Math.random() * attack;
  const mitigated = raw * (100 / (100 + defense));
  const amount = Math.max(6, Math.round(mitigated));
  if (!blocked) return amount;
  return Math.max(1, Math.round(amount * 0.28));
}
