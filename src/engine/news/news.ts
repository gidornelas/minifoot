import type { Club, Match, NewsItem, NewsTag, Player } from "../domain";
import { NEWS_TEMPLATES, type NewsTemplate, type NewsTrigger } from "./templates";

interface RoundNewsInput {
  matches: readonly Match[];
  clubs: Record<string, Club>;
  players: Record<string, Player>;
  playerClubId: string;
  week: number;
}

interface TransferNewsInput {
  id: string;
  week: number;
  player?: Player;
  fromClub?: Club;
  toClub?: Club;
  status: "accepted" | "counter" | "rejected";
  reason: string;
  fee?: number;
}

export function generateRoundNews(input: RoundNewsInput): NewsItem[] {
  const playedMatches = input.matches.filter((match) => match.status === "played" && match.result);
  const playerMatch = playedMatches.find(
    (match) => match.homeId === input.playerClubId || match.awayId === input.playerClubId,
  );
  const topMatch = [...playedMatches].sort((a, b) => totalGoals(b) - totalGoals(a))[0];
  const specialMatches = playedMatches.filter(
    (match) => isUpset(match, input.clubs) || isComeback(match),
  );
  const selectedMatches = uniqueMatches([
    playerMatch,
    topMatch,
    ...specialMatches,
    ...playedMatches,
  ]).slice(0, 2);
  const generatedItems = selectedMatches.flatMap((match) => generateMatchNews({ ...input, match }));
  const itemLimit = input.week % 6 === 0 ? 2 : 3;

  return generatedItems.sort(sortSpecialFirst).slice(0, itemLimit);
}

export function generateMatchNews(input: RoundNewsInput & { match: Match }): NewsItem[] {
  const { match } = input;

  if (!match.result) {
    return [];
  }

  const tags: NewsTag[] = ["result"];
  const items: NewsItem[] = [
    createNewsItem("match-result", input, tags, `news-${match.id}-result`),
  ];

  if (isUpset(match, input.clubs)) {
    items.push(createNewsItem("match-upset", input, ["result", "upset"], `news-${match.id}-upset`));
  }

  if (isComeback(match)) {
    items.push(
      createNewsItem("match-comeback", input, ["result", "comeback"], `news-${match.id}-comeback`),
    );
  }

  return items;
}

export function generateTransferNews(input: TransferNewsInput): NewsItem {
  const template = selectTemplate("transfer", input.id);
  const context = {
    fee: input.fee ? String(input.fee) : "",
    fromShort: input.fromClub?.shortName ?? "CPU",
    player: input.player ? `${input.player.firstName} ${input.player.lastName}` : "Jogador",
    toShort: input.toClub?.shortName ?? "clube",
  };

  return {
    body: `${render(template.body, context)} ${input.reason}`,
    createdAt: input.week,
    id: input.id,
    importance: input.status === "accepted" ? "special" : "normal",
    relatedClubId: input.toClub?.id,
    relatedPlayerId: input.player?.id,
    tags: ["transfer"],
    title: render(template.title, context),
    type: "transfer",
    week: input.week,
  };
}

export function templateCount(): number {
  return NEWS_TEMPLATES.length;
}

function createNewsItem(
  trigger: NewsTrigger,
  input: RoundNewsInput & { match: Match },
  tags: NewsTag[],
  id: string,
): NewsItem {
  const template = selectTemplate(trigger, id);
  const context = matchContext(input.match, input.clubs, input.players);

  return {
    body: render(template.body, context),
    createdAt: input.week,
    id,
    importance: tags.includes("upset") || tags.includes("comeback") ? "special" : "normal",
    relatedClubId: context.winnerId || input.match.homeId,
    tags,
    title: render(template.title, context),
    type: "match",
    week: input.week,
  };
}

function selectTemplate(trigger: NewsTrigger, seed: string): NewsTemplate {
  const templates = NEWS_TEMPLATES.filter((template) => template.trigger === trigger);
  const index = hash(seed) % templates.length;
  const template = templates[index];

  if (!template) {
    throw new Error(`Missing news template for ${trigger}.`);
  }

  return template;
}

function matchContext(
  match: Match,
  clubs: Record<string, Club>,
  players: Record<string, Player>,
): Record<string, string> {
  const result = match.result;
  const home = clubs[match.homeId];
  const away = clubs[match.awayId];
  const homeGoals = result?.homeGoals ?? 0;
  const awayGoals = result?.awayGoals ?? 0;
  const homeWon = homeGoals > awayGoals;
  const awayWon = awayGoals > homeGoals;
  const winner = homeWon ? home : awayWon ? away : undefined;
  const loser = homeWon ? away : awayWon ? home : undefined;
  const player = result?.manOfTheMatch ? players[result.manOfTheMatch] : undefined;

  return {
    awayShort: away?.shortName ?? match.awayId,
    homeShort: home?.shortName ?? match.homeId,
    loserShort: loser?.shortName ?? "rival",
    player: player ? `${player.firstName} ${player.lastName}` : "destaque",
    score: `${homeGoals} x ${awayGoals}`,
    totalGoals: String(homeGoals + awayGoals),
    winnerId: winner?.id ?? "",
    winnerShort: winner?.shortName ?? "empate",
  };
}

function render(template: string, context: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => context[key] ?? "");
}

function isUpset(match: Match, clubs: Record<string, Club>): boolean {
  if (!match.result) {
    return false;
  }

  const home = clubs[match.homeId];
  const away = clubs[match.awayId];

  if (!home || !away) {
    return false;
  }

  if (match.result.homeGoals > match.result.awayGoals) {
    return away.reputation - home.reputation >= 8;
  }

  if (match.result.awayGoals > match.result.homeGoals) {
    return home.reputation - away.reputation >= 8;
  }

  return false;
}

function isComeback(match: Match): boolean {
  if (!match.result) {
    return false;
  }

  const finalHomeLead = match.result.homeGoals > match.result.awayGoals;
  const finalAwayLead = match.result.awayGoals > match.result.homeGoals;

  if (!finalHomeLead && !finalAwayLead) {
    return false;
  }

  return match.result.events.some((event) => {
    const [homeGoals, awayGoals] = event.scoreAfter;

    return finalHomeLead ? awayGoals > homeGoals : homeGoals > awayGoals;
  });
}

function totalGoals(match: Match): number {
  return (match.result?.homeGoals ?? 0) + (match.result?.awayGoals ?? 0);
}

function uniqueMatches(matches: Array<Match | undefined>): Match[] {
  const seen = new Set<string>();
  const unique: Match[] = [];

  for (const match of matches) {
    if (!match || seen.has(match.id)) {
      continue;
    }

    seen.add(match.id);
    unique.push(match);
  }

  return unique;
}

function sortSpecialFirst(a: NewsItem, b: NewsItem): number {
  if (a.importance === b.importance) {
    return 0;
  }

  return a.importance === "special" ? -1 : 1;
}

function hash(value: string): number {
  let output = 0;

  for (let index = 0; index < value.length; index += 1) {
    output = (Math.imul(output, 31) + value.charCodeAt(index)) >>> 0;
  }

  return output;
}
