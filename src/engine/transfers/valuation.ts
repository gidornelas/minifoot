import type { Player } from "../domain";

export function calculateTransferValue(player: Player): number {
  const ageMultiplier = ageValueMultiplier(player.age);
  const potentialMultiplier = 1 + Math.max(0, player.potential - player.overall) * 0.05;
  const contractMultiplier = contractValueMultiplier(player.contractUntil);
  const traitMultiplier = player.traits.includes("wonderkid")
    ? 1.22
    : player.traits.includes("leader") || player.traits.includes("big-game")
      ? 1.1
      : 1;

  return Math.round(
    player.overall ** 2.2 *
      1_000 *
      ageMultiplier *
      potentialMultiplier *
      contractMultiplier *
      traitMultiplier,
  );
}

function ageValueMultiplier(age: number): number {
  if (age > 34) {
    return 0.5;
  }

  if (age >= 30) {
    return 0.82;
  }

  if (age >= 21 && age <= 26) {
    return 1.5;
  }

  if (age < 21) {
    return 1.35;
  }

  return 1;
}

function contractValueMultiplier(contractUntil: number): number {
  if (contractUntil <= 1) {
    return 0.72;
  }

  if (contractUntil >= 4) {
    return 1.12;
  }

  return 1;
}
