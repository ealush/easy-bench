const GROUP_SIZE = 100;
const DEFAULT_COUNT = 1000;
const NS_P_S = 1e9;

const { hrtime } = process;

const toNs = (prev) => {
  const [s, ns] = hrtime(prev);
  return s * NS_P_S + ns;
};

/**
 * easyBench
 *
 * Use it like this:
 const bench = easyBench('My Benchmark');
 bench.add('case1', fn1);
 bench.add('case2', fn2);
 bench.add('case3', fn3);
 bench.add('case4', fn4);

 bench.run(2000); <- run accepts the amount of times you wish each case to be run
 */

// we want to get a significant function run time
// so we're batching them 100 at a time
const calcIndex = (counter, fns) =>
  Math.floor((counter / GROUP_SIZE) % fns.length);

/**
 * Easy to use benchmark function
 * @param description Description for benchmark suite
 */
const easyBench = (description) => {
  const fns = [];
  const api = {};

  let startTime;
  let currentIndex;

  api.add = (name, fn) => {
    fns.push({ name, fn });
    return api;
  };

  api.run = (count = DEFAULT_COUNT) => {
    const fullCount = count * fns.length;
    let counter = 0;

    while (counter < fullCount) {
      counter++;
      let index = calcIndex(counter, fns);

      if (fns.length === 1) {
        fns[index].time = fns[index].time || 0;
        const startTime = hrtime();
        runner(index);
        fns[index].time += toNs(startTime);
        continue;
      }

      if (typeof currentIndex === "undefined") {
        currentIndex = index;
        fns[currentIndex].time = fns[currentIndex].time || 0;
        startTime = hrtime();
      }
      // handles change of index
      if (index !== currentIndex) {
        fns[currentIndex].time += toNs(startTime);
        currentIndex = undefined;
      }

      // handles last fn edge case
      if (counter === fullCount) {
        startTime = hrtime();
        runner(index);
        fns[index].time += toNs(startTime);
      } else {
        runner(index);
      }
    }
    return result(count);
  };

  const result = (count) => {
    const res = fns.map(({ name, time }) => ({
      name,
      nanoseconds: time,
      milliseconds: time / 1e6,
      seconds: time / 1e9,
    }));
    console.log(
      `Benchmark for ${description}. Iteration count: ${count} rounds each.`
    );
    console.table(res.sort((a, b) => a.nanoseconds - b.nanoseconds));
    return res;
  };

  const runner = (index) => {
    try {
      fns[index].fn();
    } catch (err) {
      console.error(`Error running ${fns[index].name}:
                ${err}`);
    }
  };

  return api;
};

module.exports = easyBench;
