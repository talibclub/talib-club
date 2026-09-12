// Keep PDF rendering and uploads bounded, including on tablets.
export async function runCoverQueue(items, work, stopped = () => false) {
  let next = 0;
  const worker = async () => {
    while (!stopped() && next < items.length) {
      const item = items[next++];
      await work(item);
    }
  };
  await Promise.all(Array.from({ length: Math.min(2, items.length) }, worker));
}
