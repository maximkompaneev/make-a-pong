import { Ball } from "../entities/Ball";
import { Paddle } from "../entities/Paddle";

export function checkPaddleCollision(ball: Ball, paddle: Paddle, settings: any) {
  const withinX =
    ball.position.x - settings.ball.radius < paddle.position.x + settings.paddle.width &&
    ball.position.x + settings.ball.radius > paddle.position.x;

  const withinY =
    ball.position.y + settings.ball.radius > paddle.position.y &&
    ball.position.y - settings.ball.radius < paddle.position.y + settings.paddle.height;

  if (withinX && withinY) {
    ball.velocity.x *= -1;
    const hitPos = ball.position.y - (paddle.position.y + settings.paddle.height / 2);
    ball.velocity.y += hitPos * 0.05;
  }
}
