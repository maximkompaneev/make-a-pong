export function drawLives(
  ctx: CanvasRenderingContext2D,
  lives: number,
  max = 3,
  opts: { x?: number; y?: number; size?: number; spacing?: number } = {}
) {
  const { x = 10, y = 10, size = 30, spacing = 5 } = opts;

  ctx.save();
  ctx.textBaseline = "top";
  ctx.font = `${size}px sans-serif`;

  for (let i = 0; i < max; i++) {
    const heart = i < lives ? "❤️" : "🖤";
    const hx = x + i * (size + spacing);
    ctx.fillText(heart, hx, y);
  }

  ctx.restore();
}
