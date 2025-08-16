import { useGameSettings } from "../../stores/gameSettingsStore";
import { Vec2 } from "./Ball";

export class Paddle {
  position: Vec2;

  constructor(position: Vec2) {
    this.position = { ...position };
  }

  // Method to set the position of the paddle
  setPosition(newPosition: Vec2) {
    const { settings } = useGameSettings.getState();

    // Ensure the new position is within the canvas bounds
    this.position.x = newPosition.x;
    this.position.y = Math.max(
      0,
      Math.min(settings.canvas.height - settings.paddle.height, newPosition.y)
    );
  }

  move(dy: number, delta: number) {
    const { settings } = useGameSettings.getState();

    const nextY = this.position.y + dy * settings.paddle.speed * delta;
    this.position.y = Math.max(
      0,
      Math.min(settings.canvas.height - settings.paddle.height, nextY)
    );
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { settings } = useGameSettings.getState();
    ctx.fillStyle = settings.paddle.backgroundColor;
    ctx.fillRect(
      this.position.x,
      this.position.y,
      settings.paddle.width,
      settings.paddle.height
    );
  }
}