import { getDocumentProxy } from "unpdf";

export interface ImportedScore {
  position: number;
  home: number;
  away: number;
}

export async function extractPredictionScores(buffer: Buffer): Promise<ImportedScore[]> {
  const doc = await getDocumentProxy(new Uint8Array(buffer));
  const fields = (await doc.getFieldObjects()) as Record<
    string,
    Array<{ value?: string }>
  > | null;
  if (!fields) return [];

  const results: ImportedScore[] = [];
  for (let position = 1; position <= 72; position++) {
    const home = fields[`skoor_${position}_kodu`]?.[0]?.value;
    const away = fields[`skoor_${position}_vooras`]?.[0]?.value;
    if (home === undefined || away === undefined) continue;
    if (home === "" || away === "") continue;
    results.push({ position, home: Number(home), away: Number(away) });
  }
  return results;
}
