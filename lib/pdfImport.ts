import { PDFDocument } from "pdf-lib";

export interface ImportedScore {
  position: number;
  home: number;
  away: number;
}

export async function extractPredictionScores(buffer: Buffer): Promise<ImportedScore[]> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const form = doc.getForm();

  const results: ImportedScore[] = [];
  // Group stage is ids 1-72; knockout matches continue 73-103. The score field
  // suffix always equals the match id, so scanning the full range lets every
  // stage's sheet import through the same code path.
  for (let position = 1; position <= 104; position++) {
    const home = readField(form, `skoor_${position}_kodu`);
    const away = readField(form, `skoor_${position}_vooras`);
    if (home === null || away === null) continue;
    if (home === "" || away === "") continue;
    const h = Number(home);
    const a = Number(away);
    if (Number.isNaN(h) || Number.isNaN(a)) continue;
    results.push({ position, home: h, away: a });
  }
  return results;
}

function readField(
  form: ReturnType<PDFDocument["getForm"]>,
  name: string
): string | null {
  try {
    return form.getTextField(name).getText()?.trim() ?? "";
  } catch {
    return null;
  }
}
