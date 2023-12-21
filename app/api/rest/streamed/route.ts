export const maxDuration = 90;
export const dynamic = 'force-dynamic'; // defaults to auto

function iteratorToStream(iterator: any) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();

      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}

const sleepFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
const sleepInterval = 5000;

const encoder = new TextEncoder();

const promises = [3, 5, 2, 1, 10].map(async function* (n, index) {
  const customSleepInterval =
    Math.ceil((Math.random() * sleepInterval) / 1000) * 1000;

  yield encoder.encode(
    `<p>[${index}]  going to sleep for ${
      customSleepInterval / 1000
    } seconds ${n} times</p>`
  );
  let count = n;
  while (count--) {
    await sleepFor(customSleepInterval);
    yield encoder.encode(
      `<p>[${index}]  need to sleep ${count} more times (${
        (count * customSleepInterval) / 1000
      } seconds)...</p>`
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

async function* mergeIterators(iterators: any[]) {
  const readers = iterators.map(async function* (
    iterator: { next: () => any },
    index: any
  ) {
    let result;
    while (!(result = await iterator.next()).done) {
      yield result.value;
    }
    // Once the iterator is done, result.value contains the return object
    // with the timeSpentOnSleeping property.
    return result.value.timeSpentOnSleeping;
  });

  const mergeGenerator = async function* () {
    const nextPromises = readers.map((reader: { next: () => any }) =>
      reader.next()
    );
    while (nextPromises.length > 0) {
      const promiseResults = nextPromises.map((p: Promise<any>, index: any) =>
        p.then((value: any) => ({ value, index }))
      );
      const { value, index } = await Promise.race(promiseResults);

      if (!value.done) {
        yield value.value;
        nextPromises[index] = readers[index].next();
      } else {
        // Remove the finished iterator from the array
        nextPromises.splice(index, 1);
        readers.splice(index, 1);
      }
    }
  };

  yield* mergeGenerator();
}

// ... (rest of the code remains unchanged)

export async function GET() {
  const start = Date.now(); // Start time

  const allIterators = await Promise.all(promises);
  const combinedIterator = mergeIterators(allIterators);
  const stream = iteratorToStream(combinedIterator).getReader();

  const actualTimeIterator = (async function* () {
    while (true) {
      const { done, value } = await stream.read();
      if (done) break;
      yield value; // Yield each chunk from the original stream
    }

    const end = Date.now(); // End time
    const actualTimeSpentOnSleeping = end - start; // Calculate actual time spent
    yield encoder.encode(
      `<p>Actual time spent sleeping: ${
        actualTimeSpentOnSleeping / 1000
      } seconds</p>`
    );
  })();

  return new Response(iteratorToStream(actualTimeIterator));
}
