export class Particle {
  constructor(
    public x: number,
    public y: number,
    public vx: number,
    public vy: number,
    public color: string,
    public size: number = 4,
    public life: number = 1
  ) {}
  update(delta: number) {
    this.x += this.vx * delta;
    this.y += this.vy * delta;
    this.life -= delta;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = Math.max(this.life, 0);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}
