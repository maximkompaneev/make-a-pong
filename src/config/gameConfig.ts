const gameConfig = {
  canvas: {
    width: 800,
    height: 600,
  },
  paddle: {
    width: 15,
    height: 100,
    speed: 200, // pixels per second (was 2*60)
  },
  ball: {
    radius: 40,                       
    speed: 240,                        // pixels per second (was 4*60)
    spinStrength: 0.02,                // paddle spin influence
    maxSpin: 0.3,                      // max angular velocity
    baseSpin: 0.05,                    // natural rotation per frame
    trailLength: 50,                   // max number of trail points
    trailStartFactor: 0.6,             // trail circle size near the ball
    trailEndFactor: 0.2,               // trail circle size at tail
    paddleHitVelocityFactor: 0.15,     // vertical velocity tweak on paddle hit
    paddleHitSpeedFactor: 1.02,        // horizontal speed increase on paddle hit
    maxSpeed: 800,                      // max allowed speed
    colors: {
      main: "#6d00cc",                 // ball & trail color
      spinMarker: "#ffffff",            // optional spin indicator
    },
  },
  score: {
    left: 0,
    right: 0,
  },
};

export default gameConfig;
