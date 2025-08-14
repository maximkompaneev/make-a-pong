export function gameLoop(update: (delta: number) => void, render: () => void) {
  let lastTime = performance.now();

  function loop(time: number) {
    const delta = (time - lastTime) / 1000; // delta in seconds
    lastTime = time;

    update(delta); // movement now scaled by delta
    render();

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}
