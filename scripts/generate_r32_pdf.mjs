// Generates the fillable "Jalka MM 2026 — 1/32 finaal" prediction PDF that is
// emailed to contestants. Same visual format as the group-stage sheet:
//   #  Kuupäev  P  Kell  RIIK 1  [SKOOR]  RIIK 2  GRP
// with fillable score fields skoor_<id>_kodu / skoor_<id>_vooras (id = match id
// 73-88, so the existing PDF import maps them straight onto the matches), plus
// the 1/32 bonus questions and the Jokker combo.
//
//   node scripts/generate_r32_pdf.mjs
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
const LM = 34.016; // left margin (matches sample: table width 527.2441)
const RM = PAGE_W - LM;

// Column x-anchors (absolute), chosen so score boxes sit where the sample had them.
const COL = {
  num: 50, // center
  date: 105, // center
  day: 150, // center
  time: 192, // center
  accent: 232, // colored bar x
  team1Right: 320, // RIIK 1 right-aligned to here
  boxHomeX: 326.8,
  boxAwayX: 354.35,
  boxW: 25.15,
  boxH: 10.44,
  team2Left: 387, // RIIK 2 left-aligned from here
  grp: 545, // center
};
const ROW_H = 13.03937;

// Match id, day-of-week (ET), date, time, home, away
const MATCHES = [
  [73, "P", "28.06", "22:00", "Lõuna-Aafrika", "Kanada"],
  [74, "E", "29.06", "20:00", "Brasiilia", "Jaapan"],
  [75, "E", "29.06", "23:30", "Saksamaa", "Paraguay"],
  [76, "T", "30.06", "04:00", "Holland", "Maroko"],
  [77, "T", "30.06", "20:00", "Elevandiluurannik", "Norra"],
  [78, "K", "01.07", "00:00", "Prantsusmaa", "Rootsi"],
  [79, "K", "01.07", "04:00", "Mehhiko", "Ecuador"],
  [80, "K", "01.07", "19:00", "Inglismaa", "Kongo"],
  [81, "K", "01.07", "23:00", "Belgia", "Senegal"],
  [82, "N", "02.07", "03:00", "USA", "Bosnia ja Hertsegoviina"],
  [83, "N", "02.07", "22:00", "Hispaania", "Austria"],
  [84, "R", "03.07", "02:00", "Portugal", "Horvaatia"],
  [85, "R", "03.07", "06:00", "Šveits", "Alžeeria"],
  [86, "R", "03.07", "21:00", "Austraalia", "Egiptus"],
  [87, "L", "04.07", "01:00", "Argentiina", "Roheneemesaared"],
  [88, "L", "04.07", "04:30", "Colombia", "Ghana"],
];

const BONUS = [
  ["Mitu suluseisu fikseeritakse mängude peale kokku?", 5],
  ["Mitu nurgalööki teenib Prantsusmaa Rootsi vastu?", 3],
  ["Mitu söötu teeb Inglismaa (+/- 20)?", 4],
  ["Kas mõni mäng läheb penaltiseeriasse?", 2],
];

const JOKER_CONDITIONS = [
  "Norra võidab Elevandiluurannikut",
  "Ecuador võidab Mehhikot",
  "Portugal võidab Horvaatiat",
  "Egiptus võidab Austraaliat",
  "Maroko võidab Hollandit",
  "Belgia ja Senegal mängivad viiki",
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

// ── Logo, centered at top ──
const logoW = 132;
const logoH = (logoW * 336) / 500;
page.drawImage(logoPng, {
  x: (PAGE_W - logoW) / 2,
  y: PAGE_H - 26 - logoH,
  width: logoW,
  height: logoH,
});

// ── Table header band ──
let y = PAGE_H - 26 - logoH - 16;
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
textCentered(page, "GRP", COL.grp, hy, 7.5, bold, WHITE);

// ── Match rows ──
let rowTop = y - headerH;
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
  // accent bar
  page.drawRectangle({ x: COL.accent, y: bottom + 1.5, width: 2, height: ROW_H - 3, color: NAVY });
  textRight(page, home, COL.team1Right, baseY, 7.5, bold, NAVY);
  page.drawText(away, { x: COL.team2Left, y: baseY, size: 7.5, font: bold, color: NAVY });

  // score fields
  const boxY = bottom + (ROW_H - COL.boxH) / 2;
  for (const [suffix, bx] of [["kodu", COL.boxHomeX], ["vooras", COL.boxAwayX]]) {
    const tf = form.createTextField(`skoor_${id}_${suffix}`);
    tf.setText("");
    tf.setAlignment(1); // center
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
  textCentered(page, "", COL.grp, baseY, 6.5, bold, NAVY); // GRP empty for knockout
});

let cur = rowTop - MATCHES.length * ROW_H - 22;

function sectionLabel(label) {
  page.drawText(label.toUpperCase(), {
    x: LM,
    y: cur,
    size: 8,
    font: bold,
    color: GREY,
  });
  cur -= 14;
}

// ── Bonus questions (1/32) ──
sectionLabel("Boonusküsimused - 1/32");
BONUS.forEach(([q, pts], i) => {
  page.drawText(`${i + 1}.`, { x: LM, y: cur, size: 8, font: bold, color: GREY });
  page.drawText(q, { x: LM + 14, y: cur, size: 8, font, color: NAVY });
  const qw = font.widthOfTextAtSize(q, 8);
  page.drawText(`(${pts}p)`, { x: LM + 18 + qw, y: cur, size: 7.5, font, color: GREY });
  // fillable answer field on the right
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

// ── Jokker combo (1/32) ──
cur -= 6;
sectionLabel("Jokker combo - 1/32");
page.drawText("Jokker combo (valikuline)", { x: LM, y: cur, size: 9, font: bold, color: NAVY });
page.drawText("(25p)", {
  x: LM + 8 + bold.widthOfTextAtSize("Jokker combo (valikuline)", 9),
  y: cur,
  size: 8,
  font,
  color: GREY,
});
// opt-in checkbox
const cb = form.createCheckBox("jokker_combo");
cb.addToPage(page, {
  x: RM - 150,
  y: cur - 3,
  width: 11,
  height: 11,
  borderColor: NAVY,
  borderWidth: 0.8,
});
page.drawText("Vali Jokker combo", { x: RM - 134, y: cur, size: 8, font, color: NAVY });
cur -= 15;

const rules1 =
  "Kui valid selle jokker combo, siis nende mängude ennustused (täidetud üleval) eraldi arvesse ei lähe.";
const rules2 =
  "Selleks, et võita Jokker comboga, peavad kõik etteantud 6 küsimust täppi minema:";
page.drawText(rules1, { x: LM, y: cur, size: 7.5, font, color: GREY });
cur -= 11;
page.drawText(rules2, { x: LM, y: cur, size: 7.5, font, color: GREY });
cur -= 14;
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

const out = "scripts/Jalka_MM_2026_1-32_fillable.pdf";
fs.writeFileSync(out, await doc.save());
console.log("wrote", out);
