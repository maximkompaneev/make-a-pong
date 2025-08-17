import gameConfig from "../../config/gameConfig";
import ballImageSrc from "../../assets/ball.png";

export type Vec2 = { x: number; y: number };

type BallSettings = {
  canvas: { width: number; height: number };
  ball: {
    radius: number;
    speed: number;
    minHorizontalSpeed: number;
    baseSpin: number;
    trailLength: number;
    trailStartFactor: number;
    trailEndFactor: number;
    backgroundColor: string;
    spinStrength: number;
    maxSpin: number;
    paddleHitVelocityFactor: number;
    paddleHitSpeedFactor: number;
    maxSpeed: number;
  };
};

const defaultSettings = gameConfig as BallSettings;

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
  update(delta: number, cfg: BallSettings = defaultSettings) {
    // Move
    this.position.x += this.velocity.x * delta;
    this.position.y += this.velocity.y * delta;

    // Bounce top/bottom
    if (this.position.y - cfg.ball.radius < 0) {
      this.position.y = cfg.ball.radius;
      this.velocity.y *= -1;
      this.angularVelocity *= -1;
    } else if (this.position.y + cfg.ball.radius > cfg.canvas.height) {
      this.position.y = cfg.canvas.height - cfg.ball.radius;
      this.velocity.y *= -1;
      this.angularVelocity *= -1;
    }

    // Ensure minimum horizontal speed
    const minXSpeed = cfg.ball.minHorizontalSpeed;
    if (Math.abs(this.velocity.x) < minXSpeed) {
      this.velocity.x = Math.sign(this.velocity.x || 1) * minXSpeed;
    }

    // Spin
    this.rotation += this.angularVelocity * delta + cfg.ball.baseSpin * Math.sign(this.velocity.x);

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

    if (this.trail.length > cfg.ball.trailLength) {
      this.trail.splice(0, this.trail.length - cfg.ball.trailLength);
    }
  }

  draw(ctx: CanvasRenderingContext2D, cfg: BallSettings = defaultSettings) {
    // Trail
    for (let i = 0; i < this.trail.length; i++) {
      const pos = this.trail[i];
      const t = i / this.trail.length;
      const alpha = Math.pow((i + 1) / this.trail.length, 3);
      const sizeFactor =
        cfg.ball.trailStartFactor - (cfg.ball.trailStartFactor - cfg.ball.trailEndFactor) * t;

      const radius = cfg.ball.radius * sizeFactor;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = cfg.ball.backgroundColor;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Ball
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);

    if (this.image.complete) {
      ctx.drawImage(
        this.image,
        -cfg.ball.radius,
        -cfg.ball.radius,
        cfg.ball.radius * 2,
        cfg.ball.radius * 2
      );
    } else {
      ctx.fillStyle = cfg.ball.backgroundColor;
      ctx.beginPath();
      ctx.arc(0, 0, cfg.ball.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Small indicator line (spin feel)
    ctx.strokeStyle = cfg.ball.backgroundColor;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(cfg.ball.radius, 0);
    ctx.stroke();

    ctx.restore();
  }

  reset(cfg: BallSettings = defaultSettings) {
    this.position = { x: cfg.canvas.width / 2, y: cfg.canvas.height / 2 };
    this.rotation = 0;
    this.angularVelocity = 0;
    this.trail = [];

    const angleRange = Math.PI / 4; // 45°
    const angle = (Math.random() * 2 - 1) * angleRange;
    const direction = Math.random() < 0.5 ? 1 : -1;

    const speed = cfg.ball.speed;
    this.velocity = {
      x: Math.cos(angle) * speed * direction,
      y: Math.sin(angle) * speed,
    };
  }

  private clamp(val: number, min: number, max: number) {
    return Math.max(min, Math.min(max, val));
  }

  applyPaddleCollision(paddleY: number, paddleHeight: number, cfg: BallSettings = defaultSettings) {
    const paddleCenter = paddleY + paddleHeight / 2;
    const hitPos = this.position.y - paddleCenter;

    this.angularVelocity += hitPos * cfg.ball.spinStrength;
    this.angularVelocity = this.clamp(this.angularVelocity, -cfg.ball.maxSpin, cfg.ball.maxSpin);

    this.velocity.y += hitPos * cfg.ball.paddleHitVelocityFactor;
    this.velocity.x *= cfg.ball.paddleHitSpeedFactor;

    // Clamp max speed
    const max = cfg.ball.maxSpeed;
    this.velocity.x = this.clamp(this.velocity.x, -max, max);
    this.velocity.y = this.clamp(this.velocity.y, -max, max);
  }
}
