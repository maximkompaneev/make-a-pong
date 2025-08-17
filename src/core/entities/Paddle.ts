import gameConfig from "../../config/gameConfig";
import type { Vec2 } from "./Ball";

type PaddleSettings = {
  canvas: { width: number; height: number };
  paddle: {
    width: number;
    height: number;
    speed: number;
    backgroundColor: string;
  };
};

const settings = gameConfig as PaddleSettings;

export class Paddle {
  position: Vec2;

  constructor(position: Vec2) {
    this.position = { ...position };
  }

  setPosition(newPosition: Vec2, cfg: PaddleSettings = settings) {
    this.position.x = newPosition.x;
    this.position.y = Math.max(
      0,
      Math.min(cfg.canvas.height - cfg.paddle.height, newPosition.y)
    );
  }

  move(dy: number, delta: number, cfg: PaddleSettings = settings) {
    const nextY = this.position.y + dy * cfg.paddle.speed * delta;
    this.position.y = Math.max(
      0,
      Math.min(cfg.canvas.height - cfg.paddle.height, nextY)
    );
  }

  draw(ctx: CanvasRenderingContext2D, cfg: PaddleSettings = settings) {
    ctx.fillStyle = cfg.paddle.backgroundColor;
    ctx.fillRect(
      this.position.x,
      this.position.y,
      cfg.paddle.width,
      cfg.paddle.height
    );
  }
}
