export function drawGameOver(
  ctx: CanvasRenderingContext2D,
  score: number,
  w: number,
  h: number,
  bgColor: string = "rgba(0,0,0,0.75)" // default dark overlay
) {
  const cx = w / 2, cy = h / 2;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, h);
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff";
  ctx.font = "bold 42px sans-serif";
  ctx.fillText("Game Over", cx, cy - 40);

  ctx.font = "28px sans-serif";
  ctx.fillText(`Your score is ${Math.floor(score)}`, cx, cy + 4);

  ctx.font = "18px sans-serif";
  ctx.fillStyle = "#fff";
  ctx.fillText("Click / Tap or press Space to restart", cx, cy + 40);
}
