import { useGameSettings } from "../../stores/gameSettingsStore";
import { Vec2 } from "./Ball";

export class Paddle {
  position: Vec2;

  constructor(position: Vec2) {
    this.position = { ...position };
  }

  move(dy: number, delta: number) {
    const { settings } = useGameSettings.getState();
    const nextY = this.position.y + dy * settings.paddle.speed * delta;
    this.position.y = Math.max(0, Math.min(settings.canvas.height - settings.paddle.height, nextY));
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { settings } = useGameSettings.getState();
    ctx.fillStyle = "white";
    ctx.fillRect(this.position.x, this.position.y, settings.paddle.width, settings.paddle.height);
  }
}
