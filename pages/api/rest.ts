import { NextApiRequest, NextApiResponse } from 'next';

// This function can run for a maximum of 5 seconds
export const config = {
  maxDuration: 90,
};

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

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const start = Date.now();

  const results = await Promise.all(promises);

  const end = Date.now();
  const actualTimeSpentOnSleeping = end - start;
  console.log(
    `actual time spent on sleeping: ${actualTimeSpentOnSleeping / 1000} seconds`
  );

  response.status(200).json({
    startedAt: start,
    endedAt: end,
    actualTimeSpentOnSleeping,
    results,
  });
}
