// Rebrand pass for the static pages: "ProChess" → "Prochess" (one word, per the
// real logo/flyer/letterhead) and swap the ♞ text mark for prochess-logo.png.
// Idempotent — safe to re-run.
import fs from "node:fs";

const FILES = ["index.html", "tournament.html", "player.html", "dashboard.html"];

const OLD_LOGO = '<span class="mark piece">♞</span>Pro<b>Chess</b>';
const NEW_LOGO =
  '<img src="prochess-logo.png" alt="PROCHESS" style="width:40px;height:40px;border-radius:12px;object-fit:contain;background:#fff;padding:3px;box-shadow:0 6px 20px rgba(0,0,0,.45)">Pro<b>chess</b>';

for (const f of FILES) {
  let s = fs.readFileSync(f, "utf8");
  const logos = s.split(OLD_LOGO).length - 1;
  const brands = s.split("ProChess").length - 1;
  s = s.split(OLD_LOGO).join(NEW_LOGO);
  s = s.split("ProChess").join("Prochess");
  fs.writeFileSync(f, s);
  console.log(`${f}: logos replaced=${logos}, ProChess→Prochess=${brands}`);
}
