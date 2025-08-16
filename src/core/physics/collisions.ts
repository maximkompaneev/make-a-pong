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
    // Calculate relative intersection (center of paddle vs ball)
    const relativeIntersectY = (paddle.position.y + settings.paddle.height / 2) - ball.position.y;
    const normalizedIntersectY = relativeIntersectY / (settings.paddle.height / 2);

    const maxBounceAngle = (Math.PI / 180) * 60; // max 60 degrees
    let speed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2);

    // Increase speed slightly on each paddle hit
    speed *= 1 + settings.ball.speedIncreaseFactor; // e.g., 0.05 = +5% speed

    const bounceAngle = normalizedIntersectY * maxBounceAngle;
    const paddleSide = ball.position.x < settings.canvas.width / 2 ? 1 : -1;

    // Update ball velocity with new speed
    ball.velocity.x = speed * Math.cos(bounceAngle) * paddleSide;
    ball.velocity.y = -speed * Math.sin(bounceAngle);
  }
}
