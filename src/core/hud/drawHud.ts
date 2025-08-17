export function drawHud(
  ctx: CanvasRenderingContext2D,
  score: number,
  multiplier: number,
  width: number,
  color: string = "#6d00cc"
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = "18px sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "top";

  const right = width - 10;
  ctx.fillText(`Score: ${Math.floor(score)}`, right, 10);
  ctx.fillText(`Multiplier: ×${multiplier}`, right, 10 + 18 + 4);

  ctx.restore();
}
