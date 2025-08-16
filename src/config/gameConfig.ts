const gameConfig = {
  canvas: {
    width: 800,
    height: 600,
  },
  paddle: {
    width: 15,
    height: 100,
    speed: 80,
    backgroundColor: "#6d00cc"
  },
  ball: {
    radius: 20,
    speed: 400,                        // pixels per second
    spinStrength: 0.02,                // paddle spin influence
    maxSpin: 0.8,                      // max angular velocity
    baseSpin: 0.05,                    // natural rotation per frame
    trailLength: 100,                   // max number of trail points
    trailStartFactor: 0.6,             // trail circle size near the ball
    trailEndFactor: 0.2,               // trail circle size at tail
    paddleHitVelocityFactor: 0.15,     // vertical velocity tweak on paddle hit
    paddleHitSpeedFactor: 1.02,        // horizontal speed increase on paddle hit
    maxSpeed: 800,                      // max allowed speed
    minHorizontalSpeed: 300,         // minimum horizontal speed to avoid stuck ball
    speedIncreaseFactor: 0.06,         // increase speed by n% on each paddle hit
    backgroundColor: "#6d00cc"
    
  },
  score: {
    left: 0,
    right: 0,
  },
};

export default gameConfig;
