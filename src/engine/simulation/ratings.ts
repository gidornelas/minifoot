import type { Attributes, Position } from "../domain";

type AttributeWeights = Record<keyof Attributes, number>;

const WEIGHTS: Record<Position, AttributeWeights> = {
  GK: {
    attack: 0.05,
    passing: 0.1,
    defense: 0.5,
    pace: 0.05,
    physical: 0.15,
    mentality: 0.15,
  },
  DF: {
    attack: 0.05,
    passing: 0.15,
    defense: 0.4,
    pace: 0.1,
    physical: 0.15,
    mentality: 0.15,
  },
  MF: {
    attack: 0.15,
    passing: 0.3,
    defense: 0.15,
    pace: 0.1,
    physical: 0.15,
    mentality: 0.15,
  },
  FW: {
    attack: 0.4,
    passing: 0.15,
    defense: 0.05,
    pace: 0.2,
    physical: 0.1,
    mentality: 0.1,
  },
};

export function calculateOverall(attrs: Attributes, position: Position): number {
  const weights = WEIGHTS[position];

  return Math.round(
    attrs.attack * weights.attack +
      attrs.passing * weights.passing +
      attrs.defense * weights.defense +
      attrs.pace * weights.pace +
      attrs.physical * weights.physical +
      attrs.mentality * weights.mentality,
  );
}
