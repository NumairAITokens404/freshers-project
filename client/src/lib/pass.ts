import { EVENT } from "@shared/event";
import type { Guest } from "@shared/registration";

export async function downloadPass(guest: Guest, photo: string, id: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1500;
  const ctx = canvas.getContext("2d");
  if (!ctx)
    throw new Error(
      "Your browser couldn't create the pass. Please try another browser."
    );
  const img = new Image();
  img.src = photo;
  await img.decode();
  ctx.fillStyle = "#101014";
  ctx.fillRect(0, 0, 1080, 1500);
  ctx.fillStyle = "#d9ff43";
  ctx.fillRect(0, 0, 1080, 140);
  ctx.fillStyle = "#101014";
  ctx.font = "italic 58px Georgia, serif";
  ctx.fillText(EVENT.title, 64, 91);
  ctx.font = "bold 20px monospace";
  ctx.fillText("CSB FRESHERS ’26", 770, 84);
  ctx.fillStyle = "#faf9f4";
  ctx.font = "bold 104px sans-serif";
  ctx.fillText("ALL ACCESS.", 64, 278);
  const scale = Math.max(952 / img.width, 540 / img.height);
  ctx.save();
  ctx.beginPath();
  ctx.rect(64, 330, 952, 540);
  ctx.clip();
  ctx.drawImage(
    img,
    64 + (952 - img.width * scale) / 2,
    330 + (540 - img.height * scale) / 2,
    img.width * scale,
    img.height * scale
  );
  ctx.restore();
  ctx.fillStyle = "#d9ff43";
  ctx.font = "bold 24px sans-serif";
  ctx.fillText("THE GUEST", 64, 934);
  let size = 64;
  do {
    ctx.font = `bold ${size--}px sans-serif`;
  } while (ctx.measureText(guest.name).width > 952 && size > 12);
  ctx.fillStyle = "#faf9f4";
  ctx.fillText(guest.name, 64, 1010);
  ctx.font = "28px monospace";
  ctx.fillText(guest.rollNo, 64, 1060);
  ctx.font = "22px sans-serif";
  ctx.fillStyle = "#a9a9b2";
  ctx.fillText(guest.email, 64, 1102, 952);
  ctx.strokeStyle = "#54545d";
  ctx.setLineDash([10, 9]);
  ctx.beginPath();
  ctx.moveTo(64, 1150);
  ctx.lineTo(1016, 1150);
  ctx.stroke();
  ctx.fillStyle = "#faf9f4";
  ctx.font = "bold 38px sans-serif";
  ctx.fillText(`${EVENT.date.toUpperCase()} / ${EVENT.venue}`, 64, 1230);
  ctx.font = "28px sans-serif";
  ctx.fillText(EVENT.time, 64, 1280);
  ctx.fillStyle = "#fc73d3";
  ctx.font = "bold 24px monospace";
  ctx.fillText(
    `GUEST #${String(id).padStart(5, "0")} • CSB FRESHERS`,
    64,
    1400
  );
  const blob = await new Promise<Blob | null>(resolve =>
    canvas.toBlob(resolve, "image/png")
  );
  if (!blob) throw new Error("Couldn't export your pass. Please try again.");
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${EVENT.title}-pass-${guest.rollNo}.png`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
