// Generates the fillable "Jalka MM 2026 — veerandfinaal" prediction PDF.
// Same visual format as the earlier sheets; score fields skoor_<id>_kodu /
// skoor_<id>_vooras (id = match id 97-100) so the admin PDF import maps them
// straight onto the matches. Includes the QF bonus questions and the Jokker.
//
//   node scripts/generate_qf_pdf.mjs
//
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";

const NAVY = rgb(0.109804, 0.152941, 0.337255);
const ZEBRA = rgb(0.972549, 0.976471, 0.988235);
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

const MATCHES = [
  [97, "N", "09.07", "23:00", "Prantsusmaa", "Maroko"],
  [98, "R", "10.07", "22:00", "Hispaania", "Belgia"],
  [99, "P", "12.07", "00:00", "Norra", "Inglismaa"],
  [100, "P", "12.07", "04:00", "Argentiina", "Šveits"],
];

const BONUS = [
  ["Mitu väravat lüüakse väljastpoolt karistusala?", 3],
  ["Mitu nurgalööki antakse mängude esimesel poolajal kokku?", 5],
  ["Norra vs Inglismaa pallivaldamise protsent?", 4],
  ["Kas Maroko läheb Prantsusmaa vastu juhtima?", 2],
  ["Belgia võidab Hispaaniat rohkem kui 1 väravaga?", 3],
];

const JOKER_RULES = [
  "Kui valid Jokkeri, siis läheb arvesse ainult ühe mängu ennustus. Ükskõik milline mäng,",
  "aga skoor peab olema täpselt ennustatud.",
  "Jokkeri võit & ühe mängu skoor täpselt ennustatud = 35p + 5p.",
  "Jokkeri kaotus & ühe mängu skoor täpselt ennustatud = 5p.",
];

const JOKER_CONDITIONS = [
  "Prantsusmaa juhib Marokot esimese poolaja lõpus.",
  "Hispaania vs Belgia mäng läheb lisaajale.",
  "Norra vs Inglismaa mängus lüüakse teisel poolajal rohkem kui 2 väravat.",
  "Kaks mängu jäävad esimese poolaja lõpus 0-0.",
  "Prantsusmaa, Hispaania, Inglismaa ja Argentiina lähevad järgmisesse ringi.",
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

// ── Logo + title ──
const logoW = 132;
const logoH = (logoW * 336) / 500;
page.drawImage(logoPng, {
  x: (PAGE_W - logoW) / 2,
  y: PAGE_H - 26 - logoH,
  width: logoW,
  height: logoH,
});
let y = PAGE_H - 26 - logoH - 14;
textCentered(page, "VEERANDFINAAL", PAGE_W / 2, y, 11, bold, NAVY);
y -= 12;

// ── Table header band ──
const headerH = 18;
page.drawRectangle({ x: LM, y: y - headerH, width: RM - LM, height: headerH, color: NAVY });
const hy = y - headerH + 5.5;
textCentered(page, "#", COL.num, hy, 7.5, bold, WHITE);
textCentered(page, "Kuupäev", COL.date, hy, 7.5, bold, WHITE);
textCentered(page, "P", COL.day, hy, 7.5, bold, WHITE);
textCentered(page, "Kell", COL.time, hy, 7.5, bold, WHITE);
textCentered(page, "RIIK 1", 272, hy, 7.5, bold, WHITE);
textCentered(page, "SKOOR", (COL.boxHomeX + COL.boxAwayX + COL.boxW) / 2, hy, 7.5, bold, WHITE);
textCentered(page, "RIIK 2", 432, hy, 7.5, bold, WHITE);

// ── Match rows ──
const rowTop = y - headerH;
MATCHES.forEach(([id, day, date, time, home, away], i) => {
  const top = rowTop - i * ROW_H;
  const bottom = top - ROW_H;
  if (i % 2 === 1) {
    page.drawRectangle({ x: LM, y: bottom, width: RM - LM, height: ROW_H, color: ZEBRA });
  }
  const baseY = bottom + 4.1;
  textCentered(page, String(i + 1), COL.num, baseY, 7, font, GREY);
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
});

let cur = rowTop - MATCHES.length * ROW_H - 24;

// ── Bonus questions ──
page.drawText("BOONUSKÜSIMUSED - VEERANDFINAAL", { x: LM, y: cur, size: 8, font: bold, color: GREY });
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

// ── Jokker ──
cur -= 8;
page.drawText("JOKKER - VEERANDFINAAL", { x: LM, y: cur, size: 8, font: bold, color: GREY });
cur -= 14;
page.drawText("Jokker (valikuline)", { x: LM, y: cur, size: 9, font: bold, color: NAVY });
page.drawText("(35p)", {
  x: LM + 8 + bold.widthOfTextAtSize("Jokker (valikuline)", 9),
  y: cur,
  size: 8,
  font,
  color: GREY,
});
const cb = form.createCheckBox("jokker");
cb.addToPage(page, {
  x: RM - 130,
  y: cur - 3,
  width: 11,
  height: 11,
  borderColor: NAVY,
  borderWidth: 0.8,
});
page.drawText("Valin Jokkeri", { x: RM - 114, y: cur, size: 8, font, color: NAVY });
cur -= 14;
JOKER_RULES.forEach((line) => {
  page.drawText(line, { x: LM, y: cur, size: 7.5, font, color: GREY });
  cur -= 10.5;
});
cur -= 4;
JOKER_CONDITIONS.forEach((c, i) => {
  page.drawText(`${i + 1}.`, { x: LM + 6, y: cur, size: 8, font: bold, color: NAVY });
  page.drawText(c, { x: LM + 20, y: cur, size: 8, font, color: NAVY });
  cur -= 13;
});
cur -= 3;
page.drawText("Kehtib endiselt reegel, et tulemusi arvestatakse normaalaja kohta.", {
  x: LM,
  y: cur,
  size: 7.5,
  font,
  color: GREY,
});

const out = "scripts/Jalka_MM_2026_veerandfinaal_fillable.pdf";
fs.writeFileSync(out, await doc.save());
console.log("wrote", out);
