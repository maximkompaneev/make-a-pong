import { useGameSettings } from "../../stores/gameSettingsStore";
import ballImageSrc from "../../assets/ball.png";

export type Vec2 = { x: number; y: number };

export class Ball {
  position: Vec2;
  velocity: Vec2;
  rotation: number;
  angularVelocity: number;
  image: HTMLImageElement;
  trail: Vec2[] = [];

  constructor(position: Vec2, velocity: Vec2) {
    this.position = { ...position };
    this.velocity = { ...velocity };
    this.rotation = 0;
    this.angularVelocity = 0;

    this.image = new Image();
    this.image.src = ballImageSrc;
  }

  update(delta: number) {
    const { settings } = useGameSettings.getState();

    this.position.x += this.velocity.x * delta;
    this.position.y += this.velocity.y * delta;

    // Bounce off top/bottom
    if (this.position.y - settings.ball.radius < 0 || this.position.y + settings.ball.radius > settings.canvas.height) {
      this.velocity.y *= -1;
      this.angularVelocity *= -1;
    }

    this.rotation += this.angularVelocity * delta + settings.ball.baseSpin * Math.sign(this.velocity.x);

    this.trail.push({ x: this.position.x, y: this.position.y });
    if (this.trail.length > settings.ball.trailLength) this.trail.shift();
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { settings } = useGameSettings.getState();

    // Draw comet-style trail
    for (let i = 0; i < this.trail.length; i++) {
      const pos = this.trail[i];
      const t = i / this.trail.length;
      const alpha = (i + 1) / this.trail.length / 2;
      const sizeFactor = settings.ball.trailStartFactor - 
        (settings.ball.trailStartFactor - settings.ball.trailEndFactor) * t * t; 
      const radius = settings.ball.radius * sizeFactor;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = settings.ball.colors.main;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Draw the ball
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);

    if (this.image.complete) {
      ctx.drawImage(this.image, -settings.ball.radius, -settings.ball.radius, settings.ball.radius * 2, settings.ball.radius * 2);
    } else {
      ctx.fillStyle = settings.ball.colors.main;
      ctx.beginPath();
      ctx.arc(0, 0, settings.ball.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = settings.ball.colors.spinMarker;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(settings.ball.radius, 0);
    ctx.stroke();

    ctx.restore();
  }

  reset(settings: any) {
    this.position = { x: settings.canvas.width / 2, y: settings.canvas.height / 2 };
    this.velocity = { x: settings.ball.speed, y: settings.ball.speed };
    this.rotation = 0;
    this.angularVelocity = 0;
    this.trail = [];
  }

  clamp(val: number, min: number, max: number) {
    return Math.max(min, Math.min(max, val));
  }

  applyPaddleCollision(paddleY: number, paddleHeight: number) {
    const { settings } = useGameSettings.getState();
    const paddleCenter = paddleY + paddleHeight / 2;
    const hitPos = this.position.y - paddleCenter;

    this.angularVelocity += hitPos * settings.ball.spinStrength;
    this.angularVelocity = this.clamp(this.angularVelocity, -settings.ball.maxSpin, settings.ball.maxSpin);

    this.velocity.y += hitPos * settings.ball.paddleHitVelocityFactor;
    this.velocity.x *= settings.ball.paddleHitSpeedFactor;

    // Optionally clamp max speed
    const max = settings.ball.maxSpeed;
    this.velocity.x = this.clamp(this.velocity.x, -max, max);
    this.velocity.y = this.clamp(this.velocity.y, -max, max);
  }
}
