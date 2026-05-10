export type Formation = "4-3-3" | "4-4-2" | "4-5-1" | "3-5-2";

export type Mentality = "attack" | "balanced" | "defend";

export interface MatchTactic {
  formation: Formation;
  mentality: Mentality;
}

export interface TacticModifiers {
  attackMultiplier: number;
  defenseModifier: number;
  eventMultiplier: number;
  ratingBonus: number;
}

export const DEFAULT_TACTIC: MatchTactic = {
  formation: "4-4-2",
  mentality: "balanced",
};

const FORMATION_MODIFIERS: Record<Formation, Omit<TacticModifiers, "ratingBonus">> = {
  "4-3-3": {
    attackMultiplier: 1.1,
    defenseModifier: -1.2,
    eventMultiplier: 1,
  },
  "4-4-2": {
    attackMultiplier: 1,
    defenseModifier: 0,
    eventMultiplier: 1,
  },
  "4-5-1": {
    attackMultiplier: 0.9,
    defenseModifier: 1.4,
    eventMultiplier: 0.92,
  },
  "3-5-2": {
    attackMultiplier: 1.02,
    defenseModifier: 0,
    eventMultiplier: 1.12,
  },
};

const MENTALITY_ATTACK_MULTIPLIER: Record<Mentality, number> = {
  attack: 1.08,
  balanced: 1,
  defend: 0.9,
};

const MENTALITY_DEFENSE_MODIFIER: Record<Mentality, number> = {
  attack: -0.9,
  balanced: 0,
  defend: 1.1,
};

export function getTacticModifiers(tactic: MatchTactic = DEFAULT_TACTIC): TacticModifiers {
  const formation = FORMATION_MODIFIERS[tactic.formation];
  const attackMultiplier =
    formation.attackMultiplier * MENTALITY_ATTACK_MULTIPLIER[tactic.mentality];
  const defenseModifier = formation.defenseModifier + MENTALITY_DEFENSE_MODIFIER[tactic.mentality];

  return {
    attackMultiplier,
    defenseModifier,
    eventMultiplier: formation.eventMultiplier,
    ratingBonus: Math.max(-3, Math.min(3, defenseModifier * 0.45 + (attackMultiplier - 1) * 2)),
  };
}
