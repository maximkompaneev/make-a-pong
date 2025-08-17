export class ScreenShake {
  t = 0;

  start(duration = 0.3) {
    this.t = Math.max(this.t, duration);
  }

  update(dt: number) {
    if (this.t > 0) this.t = Math.max(0, this.t - dt);
  }

  getOffset(): { x: number; y: number } {
    if (this.t <= 0) return { x: 0, y: 0 };
    return { x: (Math.random() - 0.5) * 10, y: (Math.random() - 0.5) * 10 };
  }

  reset() {
    this.t = 0;
  }
}
