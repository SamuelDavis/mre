export type Limiter = <T>(task: () => Promise<T>) => Promise<T>;

export function createLimiter(concurrency: number): Limiter {
  let active = 0;
  const queue: (() => void)[] = [];

  function next(): void {
    if (active >= concurrency) return;
    const start = queue.shift();
    if (!start) return;
    active++;
    start();
  }

  function release(): void {
    active--;
    next();
  }

  return function limit<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      queue.push(() => task().then(resolve, reject).finally(release));
      next();
    });
  };
}
