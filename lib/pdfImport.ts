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
  for (let position = 1; position <= 72; position++) {
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
