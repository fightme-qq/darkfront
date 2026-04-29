import type { BattleResult, UnitInstance } from "./types";
import { nextInt } from "./rng";

export function getTeamPower(team: Array<UnitInstance | null>) {
  return team.reduce((total, unit) => {
    if (!unit) {
      return total;
    }

    return total + unit.attack + unit.health + unit.level * 2;
  }, 0);
}

export function resolveMockBattle(
  team: Array<UnitInstance | null>,
  turn: number,
  wins: number,
  seed: number
) {
  const teamPower = getTeamPower(team);
  const roll = nextInt(seed, 8);
  const enemyPower = 10 + turn * 4 + wins * 3 + roll.value * 2;

  let outcome: BattleResult["outcome"] = "draw";
  if (teamPower > enemyPower + 2) {
    outcome = "win";
  } else if (enemyPower > teamPower + 2) {
    outcome = "loss";
  }

  const summary =
    outcome === "win"
      ? "Отряд продавил вражескую линию."
      : outcome === "loss"
        ? "Противник оказался сильнее в размене."
        : "Силы оказались равны.";

  return {
    seed: roll.seed,
    result: { outcome, enemyPower, teamPower, summary },
  };
}
