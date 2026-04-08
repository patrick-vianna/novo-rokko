export async function delay(config: { seconds?: number }) {
  const seconds = config.seconds || 0;

  if (seconds > 0) {
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }

  return { delayed: true, seconds };
}
