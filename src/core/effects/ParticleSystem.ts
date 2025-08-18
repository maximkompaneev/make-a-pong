import { Particle } from "./Particle";

export class ParticleSystem {
  particles: Particle[] = [];

  add(p: Particle) {
    this.particles.push(p);
  }

  clear() {
    this.particles.length = 0;
  }

  get size() {
    return this.particles.length;
  }

  update(dt: number) {
    for (const p of this.particles) p.update(dt);
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) p.draw(ctx);
  }

  burst(
    x: number,
    y: number,
    count = 50,
    colors = ["#6d00cc", "#337ab7", "#f024f6"]
  ) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = Math.random() * 300 + 50;
      this.add(
        new Particle(
          x,
          y,
          Math.cos(a) * s,
          Math.sin(a) * s,
          colors[(Math.random() * colors.length) | 0],
          Math.random() * 4 + 2
        )
      );
    }
  }

  confetti(x: number, y: number) {
    this.burst(x, y, 30);
  }

  mega(centerX: number, centerY: number, count = 140) {
    const colors = ["#6d00cc", "#337ab7", "#f024f6", "#ffffff"];
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 250 + Math.random() * 350;
      this.add(
        new Particle(
          centerX,
          centerY,
          Math.cos(a) * s,
          Math.sin(a) * s,
          colors[(Math.random() * colors.length) | 0],
          4 + Math.random() * 4,
          1.5 + Math.random() * 0.7
        )
      );
    }
  }
}
