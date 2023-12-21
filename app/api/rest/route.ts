export const maxDuration = 90;

export const dynamic = 'force-dynamic'; // defaults to auto

const sleepFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
const sleepInterval = 5000;

const promises = [3, 5, 2, 1, 10].map(async function (n, index) {
  const customSleepInterval =
    Math.ceil((Math.random() * sleepInterval) / 1000) * 1000;

  console.log(
    `[${index}] going to sleep for ${
      customSleepInterval / 1000
    } seconds ${n} times`
  );
  let count = n;
  while (count--) {
    await sleepFor(customSleepInterval);
    console.log(
      `[${index}] need to sleep ${count} more times (${
        (count * customSleepInterval) / 1000
      } seconds)...`
    );
  }
  const timeSpentOnSleeping = n * customSleepInterval;
  console.log(
    `[${index}] done sleeping for ${timeSpentOnSleeping / 1000} seconds`
  );
  return {
    timeSpentOnSleeping,
  };
});

export async function GET(request: Request) {
  // calculate the time it takes to resolve all promises
  const start = Date.now();

  const results = await Promise.all(promises);

  const end = Date.now();
  const actualTimeSpentOnSleeping = end - start;
  console.log(
    `actual time spent on sleeping: ${actualTimeSpentOnSleeping / 1000} seconds`
  );
  return new Response(
    JSON.stringify({
      startedAt: start,
      endedAt: end,
      actualTimeSpentOnSleeping,
      results,
    }),
    {
      headers: { 'content-type': 'application/json' },
    }
  );
}
