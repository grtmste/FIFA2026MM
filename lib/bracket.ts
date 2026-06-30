import { Match } from "./types";

export interface TeamStanding {
  team: string;
  group: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

function initStanding(team: string, group: string): TeamStanding {
  return { team, group, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0 };
}

function compareStandings(a: TeamStanding, b: TeamStanding): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  return a.team.localeCompare(b.team);
}

export function computeGroupStandings(matches: Match[]): Record<string, TeamStanding[]> {
  const groups: Record<string, Map<string, TeamStanding>> = {};

  for (const m of matches) {
    if (m.stage !== "group" || !m.group_name) continue;
    const g = m.group_name;
    if (!groups[g]) groups[g] = new Map();
    if (!groups[g].has(m.home_team)) groups[g].set(m.home_team, initStanding(m.home_team, g));
    if (!groups[g].has(m.away_team)) groups[g].set(m.away_team, initStanding(m.away_team, g));

    if (m.actual_home_score !== null && m.actual_away_score !== null) {
      const home = groups[g].get(m.home_team)!;
      const away = groups[g].get(m.away_team)!;
      home.played++; away.played++;
      home.goalsFor += m.actual_home_score; home.goalsAgainst += m.actual_away_score;
      away.goalsFor += m.actual_away_score; away.goalsAgainst += m.actual_home_score;
      home.goalDiff = home.goalsFor - home.goalsAgainst;
      away.goalDiff = away.goalsFor - away.goalsAgainst;
      if (m.actual_home_score > m.actual_away_score) {
        home.won++; home.points += 3; away.lost++;
      } else if (m.actual_home_score < m.actual_away_score) {
        away.won++; away.points += 3; home.lost++;
      } else {
        home.drawn++; home.points += 1; away.drawn++; away.points += 1;
      }
    }
  }

  const result: Record<string, TeamStanding[]> = {};
  for (const [g, map] of Object.entries(groups)) {
    result[g] = Array.from(map.values()).sort(compareStandings);
  }
  return result;
}

/**
 * The R32 bracket. Each slot maps a match ID to two team "codes":
 *   "A1" = Group A winner, "A2" = runner-up, "3A" = best 3rd-place #1, etc.
 *   "W73" = winner of match 73, etc.
 */
export const BRACKET_SLOTS: Array<{ id: number; home: string; away: string }> = [
  // R32 — group winners vs runners-up (paired groups)
  { id: 73,  home: "A1",  away: "B2"  },
  { id: 74,  home: "B1",  away: "A2"  },
  { id: 75,  home: "C1",  away: "D2"  },
  { id: 76,  home: "D1",  away: "C2"  },
  { id: 77,  home: "E1",  away: "F2"  },
  { id: 78,  home: "F1",  away: "E2"  },
  { id: 79,  home: "G1",  away: "H2"  },
  { id: 80,  home: "H1",  away: "G2"  },
  { id: 81,  home: "I1",  away: "J2"  },
  { id: 82,  home: "J1",  away: "I2"  },
  { id: 83,  home: "K1",  away: "L2"  },
  { id: 84,  home: "L1",  away: "K2"  },
  // R32 — 8 best 3rd-place teams (ranked 1–8 across all groups)
  { id: 85,  home: "3A",  away: "3E"  },
  { id: 86,  home: "3B",  away: "3F"  },
  { id: 87,  home: "3C",  away: "3G"  },
  { id: 88,  home: "3D",  away: "3H"  },
  // R16
  { id: 89,  home: "W73", away: "W74" },
  { id: 90,  home: "W75", away: "W76" },
  { id: 91,  home: "W77", away: "W78" },
  { id: 92,  home: "W79", away: "W80" },
  { id: 93,  home: "W81", away: "W82" },
  { id: 94,  home: "W83", away: "W84" },
  { id: 95,  home: "W85", away: "W86" },
  { id: 96,  home: "W87", away: "W88" },
  // QF
  { id: 97,  home: "W89", away: "W90" },
  { id: 98,  home: "W91", away: "W92" },
  { id: 99,  home: "W93", away: "W94" },
  { id: 100, home: "W95", away: "W96" },
  // SF
  { id: 101, home: "W97",  away: "W98"  },
  { id: 102, home: "W99",  away: "W100" },
  // Final
  { id: 103, home: "W101", away: "W102" },
];

function isGroupComplete(matches: Match[], group: string): boolean {
  const groupMatches = matches.filter(
    (m) => m.stage === "group" && m.group_name === group
  );
  if (groupMatches.length === 0) return false;
  return groupMatches.every(
    (m) => m.actual_home_score !== null && m.actual_away_score !== null
  );
}

export function resolveBracketTeams(
  allMatches: Match[]
): Array<{ id: number; home_team: string; away_team: string }> {
  const standings = computeGroupStandings(allMatches);
  const completeGroups = new Set(
    Object.keys(standings).filter((g) => isGroupComplete(allMatches, g))
  );

  // Build team-code → team-name map — only from groups that are fully played
  const code: Record<string, string> = {};
  for (const [g, teams] of Object.entries(standings)) {
    if (!completeGroups.has(g)) continue;
    if (teams[0]) code[`${g}1`] = teams[0].team;
    if (teams[1]) code[`${g}2`] = teams[1].team;
    if (teams[2]) code[`${g}3`] = teams[2].team; // raw, used below
  }

  // Best 8 third-place teams ranked overall — only from completed groups
  const thirds = Object.entries(standings)
    .filter(([g]) => completeGroups.has(g))
    .map(([, teams]) => teams[2])
    .filter(Boolean)
    .sort(compareStandings)
    .slice(0, 8);
  thirds.forEach((t, i) => { code[`3${String.fromCharCode(65 + i)}`] = t.team; });

  // Match-winner lookup
  const matchMap = new Map(allMatches.map((m) => [m.id, m]));
  const winner = (matchId: number): string | null => {
    const m = matchMap.get(matchId);
    if (!m || m.actual_home_score === null || m.actual_away_score === null) return null;
    if (m.actual_home_score > m.actual_away_score) return m.home_team;
    if (m.actual_away_score > m.actual_home_score) return m.away_team;
    // Normal-time draw — decided by the recorded penalty shootout winner.
    if (m.penalty_winner === "home") return m.home_team;
    if (m.penalty_winner === "away") return m.away_team;
    return null;
  };

  const resolve = (c: string): string | null => {
    if (code[c]) return code[c];
    if (c.startsWith("W")) return winner(parseInt(c.slice(1)));
    return null;
  };

  const updates: Array<{ id: number; home_team: string; away_team: string }> = [];
  for (const slot of BRACKET_SLOTS) {
    const home = resolve(slot.home) ?? "Selgub";
    const away = resolve(slot.away) ?? "Selgub";
    updates.push({ id: slot.id, home_team: home, away_team: away });
  }
  return updates;
}
