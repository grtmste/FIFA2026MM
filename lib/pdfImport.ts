import { PDFParse } from "pdf-parse";

export interface ImportedScore {
  position: number;
  home: number;
  away: number;
}

const ROW_RE = /^\s*(\d{1,2})\s+\d{2}\.\d{2}\s+\S\s+\d{2}:\d{2}\s+.+?\s(\d+)\s+(\d+)\s+\D/;

export function parsePredictionText(text: string): ImportedScore[] {
  const results: ImportedScore[] = [];
  for (const line of text.split("\n")) {
    const m = line.match(ROW_RE);
    if (!m) continue;
    const position = Number(m[1]);
    if (position < 1 || position > 72) continue;
    results.push({ position, home: Number(m[2]), away: Number(m[3]) });
  }
  return results;
}

export async function extractPredictionScores(buffer: Buffer): Promise<ImportedScore[]> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await parser.getText();
  return parsePredictionText(result.text);
}
