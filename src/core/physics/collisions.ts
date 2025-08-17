import { Ball } from "../entities/Ball";
import { Paddle } from "../entities/Paddle";

export function checkPaddleCollision(ball: Ball, paddle: Paddle, settings: any) {
  const r = settings.ball.radius;
  const pX = paddle.position.x;
  const pY = paddle.position.y;
  const pW = settings.paddle.width;
  const pH = settings.paddle.height;

  const isLeftPaddle = pX < settings.canvas.width / 2;
  const inset = settings.paddle.collisionInset ?? 4;

  // boundaries
  const ballLeft   = ball.position.x - r;
  const ballRight  = ball.position.x + r;
  const ballTop    = ball.position.y - r;
  const ballBottom = ball.position.y + r;

  const padLeft  = pX;
  const padRight = pX + pW;
  const padTop   = pY;
  const padBot   = pY + pH;

  const overlapY = ballBottom > padTop && ballTop < padBot;
  const overlapX = isLeftPaddle
    ? (ballRight > padLeft - inset) && (ballLeft < padRight)
    : (ballLeft  < padRight + inset) && (ballRight > padLeft);

  if (!overlapX || !overlapY) return;

  // only bounce if moving toward the paddle
  const movingToward =
    (isLeftPaddle && ball.velocity.x < 0) ||
    (!isLeftPaddle && ball.velocity.x > 0);
  if (!movingToward) return;

  // corrections
  ball.position.x = isLeftPaddle
    ? (padLeft + inset) + r + 0.5
    : (padRight - inset) - r - 0.5;

  // bounce angle 
  const paddleCenterY = pY + pH / 2;
  const relativeIntersectY = paddleCenterY - ball.position.y;
  const normalizedIntersectY = relativeIntersectY / (pH / 2);
  const maxBounceAngle = (Math.PI / 180) * 60;
  const bounceAngle = normalizedIntersectY * maxBounceAngle;

  // amplify speed
  const curSpeed = Math.hypot(ball.velocity.x, ball.velocity.y);
  const ramp = Math.max(0, settings.ball.speedIncreaseFactor ?? 0);
  let targetSpeed = curSpeed * (1 + ramp);

  // unit vector
  const dirX = (isLeftPaddle ? 1 : -1) * Math.cos(bounceAngle);
  const dirY = -Math.sin(bounceAngle);
  const len = Math.hypot(dirX, dirY) || 1;

  ball.velocity.x = (dirX / len) * targetSpeed;
  ball.velocity.y = (dirY / len) * targetSpeed;

  // force minimal speed
  const minHX = settings.ball.minHorizontalSpeed;
  if (Math.abs(ball.velocity.x) < minHX) {
    const sign = Math.sign(ball.velocity.x) || (isLeftPaddle ? 1 : -1);
    const ratio = minHX / Math.abs(ball.velocity.x || 1);
    ball.velocity.x *= ratio * sign;
    ball.velocity.y *= ratio;
  }

  // clamp max speed
  const mag = Math.hypot(ball.velocity.x, ball.velocity.y);
  const max = settings.ball.maxSpeed;
  if (mag > max) {
    const s = max / mag;
    ball.velocity.x *= s;
    ball.velocity.y *= s;
  }

  ball.applyPaddleCollision(pY, pH, settings);
}
