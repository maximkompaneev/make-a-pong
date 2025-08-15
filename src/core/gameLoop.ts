export function gameLoop(update: (delta: number) => void, render: () => void) {
  let lastTime = performance.now();
  let running = true;

  function loop(time: number) {
    if (!running) return;

    let delta = (time - lastTime) / 1000;
    lastTime = time;

    delta = Math.min(delta, 0.05); 

    update(delta);
    render();

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);

  return () => {
    running = false;
  };
}
