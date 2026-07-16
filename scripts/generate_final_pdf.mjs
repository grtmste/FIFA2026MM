// Generates the fillable "Jalka MM 2026 — 1/16 finaal" prediction PDF that is
// emailed to contestants. Same visual format as the earlier sheets:
//   #  Kuupäev  P  Kell  RIIK 1  [SKOOR]  RIIK 2
// with fillable score fields skoor_<id>_kodu / skoor_<id>_vooras (id = match id
// 101-102, so the existing PDF import maps them straight onto the matches), plus
// the 1/16 bonus questions.
//
//   node scripts/generate_final_pdf.mjs
//
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";

const NAVY = rgb(0.109804, 0.152941, 0.337255); // #1C2756
const ZEBRA = rgb(0.972549, 0.976471, 0.988235); // #F8F9FC
const GREY = rgb(0.61, 0.64, 0.69);
const LINE = rgb(0.83, 0.85, 0.88);
const WHITE = rgb(1, 1, 1);

const PAGE_W = 595.2756;
const PAGE_H = 841.8898;
const LM = 34.016;
const RM = PAGE_W - LM;

const COL = {
  num: 50,
  date: 105,
  day: 150,
  time: 192,
  accent: 232,
  team1Right: 320,
  boxHomeX: 326.8,
  boxAwayX: 354.35,
  boxW: 25.15,
  boxH: 10.44,
  team2Left: 387,
};
const ROW_H = 13.03937;

// Match id, day-of-week (ET), date, time, home, away
const MATCHES = [
  [104, "P", "19.07", "00:00", "Prantsusmaa", "Inglismaa"],
  [103, "P", "19.07", "22:00", "Hispaania", "Argentiina"],
];

const BONUS = [
  ["Kas VAR võtab mõne värava ära?", 2],
  ["Mitu tõrjet teeb finaali võitja võistkonna väravavaht?", 4],
  ["Kas mõni vahetusmängija lööb värava?", 3],
  ["Kes valitakse pronksimängu parimaks mängijaks?", 4],
  ["Kes (mängija) lööb turniiri viimase värava?", 4],
  ["Milline mängija läbib finaalis kõige pikema vahemaa?", 4],
];

const doc = await PDFDocument.create();
const font = await doc.embedFont(StandardFonts.Helvetica);
const bold = await doc.embedFont(StandardFonts.HelveticaBold);
const logoPng = await doc.embedPng(fs.readFileSync("public/jalka-logo.png"));
const form = doc.getForm();

const page = doc.addPage([PAGE_W, PAGE_H]);

function textCentered(p, s, x, y, size, f, color) {
  const w = f.widthOfTextAtSize(s, size);
  p.drawText(s, { x: x - w / 2, y, size, font: f, color });
}
function textRight(p, s, x, y, size, f, color) {
  const w = f.widthOfTextAtSize(s, size);
  p.drawText(s, { x: x - w, y, size, font: f, color });
}

// ── Logo ──
const logoW = 132;
const logoH = (logoW * 336) / 500;
page.drawImage(logoPng, {
  x: (PAGE_W - logoW) / 2,
  y: PAGE_H - 26 - logoH,
  width: logoW,
  height: logoH,
});

// The two matches are shown as separate labelled blocks.
const SECTIONS = [
  { label: "3. KOHA MÄNG", match: MATCHES[0] },
  { label: "FINAAL", match: MATCHES[1] },
];
const headerH = 18;

function drawHeaderBand(y) {
  page.drawRectangle({ x: LM, y: y - headerH, width: RM - LM, height: headerH, color: NAVY });
  const hy = y - headerH + 5.5;
  textCentered(page, "Kuupäev", COL.date, hy, 7.5, bold, WHITE);
  textCentered(page, "P", COL.day, hy, 7.5, bold, WHITE);
  textCentered(page, "Kell", COL.time, hy, 7.5, bold, WHITE);
  textCentered(page, "RIIK 1", 272, hy, 7.5, bold, WHITE);
  textCentered(page, "SKOOR", (COL.boxHomeX + COL.boxAwayX + COL.boxW) / 2, hy, 7.5, bold, WHITE);
  textCentered(page, "RIIK 2", 432, hy, 7.5, bold, WHITE);
}

function drawMatchRow(y, [id, day, date, time, home, away]) {
  const bottom = y - ROW_H;
  const baseY = bottom + 4.1;
  textCentered(page, date, COL.date, baseY, 7, bold, NAVY);
  textCentered(page, day, COL.day, baseY, 6.5, font, GREY);
  textCentered(page, time, COL.time, baseY, 7, bold, NAVY);
  page.drawRectangle({ x: COL.accent, y: bottom + 1.5, width: 2, height: ROW_H - 3, color: NAVY });
  textRight(page, home, COL.team1Right, baseY, 7.5, bold, NAVY);
  page.drawText(away, { x: COL.team2Left, y: baseY, size: 7.5, font: bold, color: NAVY });

  const boxY = bottom + (ROW_H - COL.boxH) / 2;
  for (const [suffix, bx] of [["kodu", COL.boxHomeX], ["vooras", COL.boxAwayX]]) {
    const tf = form.createTextField(`skoor_${id}_${suffix}`);
    tf.setText("");
    tf.setAlignment(1);
    tf.addToPage(page, {
      x: bx,
      y: boxY,
      width: COL.boxW,
      height: COL.boxH,
      borderColor: LINE,
      borderWidth: 0.5,
      backgroundColor: WHITE,
      textColor: NAVY,
    });
    tf.setFontSize(8);
  }
}

let cur = PAGE_H - 26 - logoH - 18;
for (const { label, match } of SECTIONS) {
  page.drawText(label, { x: LM, y: cur, size: 10, font: bold, color: NAVY });
  cur -= 6;
  drawHeaderBand(cur);
  cur -= headerH;
  drawMatchRow(cur, match);
  cur -= ROW_H + 20;
}

cur -= 6;

// ── Bonus questions (1/16) ──
page.drawText("BOONUSKÜSIMUSED - FINAAL", { x: LM, y: cur, size: 8, font: bold, color: GREY });
cur -= 15;
BONUS.forEach(([q, pts], i) => {
  page.drawText(`${i + 1}.`, { x: LM, y: cur, size: 8, font: bold, color: GREY });
  page.drawText(q, { x: LM + 14, y: cur, size: 8, font, color: NAVY });
  const qw = font.widthOfTextAtSize(q, 8);
  page.drawText(`(${pts}p)`, { x: LM + 18 + qw, y: cur, size: 7.5, font, color: GREY });
  const tf = form.createTextField(`lisakusimus_${i + 1}`);
  tf.setText("");
  tf.addToPage(page, {
    x: RM - 110,
    y: cur - 2.5,
    width: 110,
    height: 11,
    borderColor: LINE,
    borderWidth: 0,
    backgroundColor: rgb(0.97, 0.97, 0.98),
    textColor: NAVY,
  });
  tf.setFontSize(8);
  cur -= 18;
});

cur -= 6;
page.drawText("Kehtib endiselt reegel, et tulemusi arvestatakse normaalaja kohta.", {
  x: LM,
  y: cur,
  size: 7.5,
  font,
  color: GREY,
});

const out = "scripts/Jalka_MM_2026_finaal_fillable.pdf";
fs.writeFileSync(out, await doc.save());
console.log("wrote", out);
