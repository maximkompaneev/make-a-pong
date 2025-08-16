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
    const prevPos = { ...this.position };

    // Move
    this.position.x += this.velocity.x * delta;
    this.position.y += this.velocity.y * delta;

    // Bounce top/bottom
    if (this.position.y - settings.ball.radius < 0) {
      this.position.y = settings.ball.radius;
      this.velocity.y *= -1;
      this.angularVelocity *= -1;
    } else if (this.position.y + settings.ball.radius > settings.canvas.height) {
      this.position.y = settings.canvas.height - settings.ball.radius;
      this.velocity.y *= -1;
      this.angularVelocity *= -1;
    }

    // Ensure minimum horizontal speed
    const minXSpeed = settings.ball.minHorizontalSpeed;
    if (Math.abs(this.velocity.x) < minXSpeed) {
      this.velocity.x = Math.sign(this.velocity.x || 1) * minXSpeed;
    }

    this.rotation += this.angularVelocity * delta + settings.ball.baseSpin * Math.sign(this.velocity.x);

    // Trail interpolation
    const lastPos = this.trail.length ? this.trail[this.trail.length - 1] : null;
    if (lastPos) {
      const dist = Math.hypot(this.position.x - lastPos.x, this.position.y - lastPos.y);
      const steps = Math.max(1, Math.floor(dist / 2)); // 2px spacing
      for (let i = 1; i <= steps; i++) {
        this.trail.push({
          x: lastPos.x + ((this.position.x - lastPos.x) * i) / steps,
          y: lastPos.y + ((this.position.y - lastPos.y) * i) / steps,
        });
      }
    } else {
      this.trail.push({ ...this.position });
    }

    if (this.trail.length > settings.ball.trailLength) {
      this.trail.splice(0, this.trail.length - settings.ball.trailLength);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const { settings } = useGameSettings.getState();

    // Draw trail
    for (let i = 0; i < this.trail.length; i++) {
      const pos = this.trail[i];
      const t = i / this.trail.length;
       const alpha = Math.pow((i + 1) / this.trail.length, 3);
      const sizeFactor = settings.ball.trailStartFactor - (settings.ball.trailStartFactor - settings.ball.trailEndFactor) * t;

      const radius = settings.ball.radius * sizeFactor;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = settings.ball.backgroundColor;
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
      ctx.fillStyle = settings.ball.backgroundColor;
      ctx.beginPath();
      ctx.arc(0, 0, settings.ball.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = settings.ball.backgroundColor;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(settings.ball.radius, 0);
    ctx.stroke();

    ctx.restore();
  }

  reset(settings: any) {
    this.position = { x: settings.canvas.width / 2, y: settings.canvas.height / 2 };
    this.rotation = 0;
    this.angularVelocity = 0;
    this.trail = [];

    const angleRange = Math.PI / 4; // 45 degrees
    const angle = (Math.random() * 2 - 1) * angleRange;
    const direction = Math.random() < 0.5 ? 1 : -1;

    const speed = settings.ball.speed;
    this.velocity = {
      x: Math.cos(angle) * speed * direction,
      y: Math.sin(angle) * speed,
    };
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

    // Clamp max speed
    const max = settings.ball.maxSpeed;
    this.velocity.x = this.clamp(this.velocity.x, -max, max);
    this.velocity.y = this.clamp(this.velocity.y, -max, max);
  }
}
