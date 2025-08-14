import { useGameSettings } from "../../stores/gameSettingsStore";

export type Vec2 = { x: number; y: number };

export class Ball {
  position: Vec2;
  velocity: Vec2;

  constructor(position: Vec2, velocity: Vec2) {
    this.position = { ...position };
    this.velocity = { ...velocity };
  }

  update(delta: number) {
    const { settings } = useGameSettings.getState();
    this.position.x += this.velocity.x * delta;
    this.position.y += this.velocity.y * delta;

    if (this.position.y - settings.ball.radius < 0 || this.position.y + settings.ball.radius > settings.canvas.height) {
      this.velocity.y *= -1;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { settings } = useGameSettings.getState();
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, settings.ball.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  reset(settings: any) {
    this.position = { x: settings.canvas.width / 2, y: settings.canvas.height / 2 };
    this.velocity = { x: settings.ball.speed, y: settings.ball.speed };
  }
}
