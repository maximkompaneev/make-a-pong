export function gameLoop(update: (delta: number) => void, render: () => void) {
  const raf = requestAnimationFrame;
  const now = performance.now.bind(performance);

  let lastTime = now();
  let running = true;

  function loop(time: number) {
    if (!running) return;

    let delta = (time - lastTime) * 0.001; // convert to seconds
    lastTime = time;

    if (delta > 0.05) delta = 0.05; // clamp

    update(delta);
    render();

    raf(loop);
  }

  raf(loop);

  // return a stop function
  return () => {
    running = false;
  };
}
