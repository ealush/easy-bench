const GROUP_SIZE = 100;
const DEFAULT_COUNT = 1000;

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
const calcIndex = (counter, fns) => Math.floor((counter / GROUP_SIZE) % fns.length);

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
        fns.push({name, fn});
        return api;
    };

    api.run = (count = DEFAULT_COUNT) => {
        const fullCount = count * fns.length;
        let counter = 0;

        while (counter < fullCount) {
            counter++;
            let index = calcIndex(counter, fns);

            if (typeof currentIndex === 'undefined') {
                currentIndex = index;
                fns[currentIndex].time = fns[currentIndex].time || 0;
                startTime = Date.now();
            }

            // handles change of index
            if (index !== currentIndex) {
                fns[currentIndex].time += Date.now() - startTime;
                currentIndex = undefined;
            }

            // handles last fn edge case
            if (counter === fullCount) {
                startTime = Date.now();
                runner(index);
                fns[index].time += Date.now() - startTime;
            } else {
                runner(index);
            }
        }
        return result();
    }

    const result = () => {
        const res = fns.map(({ name, time }) => ({
            name,
            time: time + 'ms'
        }));
        console.log(`Benchmark for ${description}:`);
        console.table(res)
        return res;
    }

    const runner = (index) => {
        try {
            fns[index].fn();
        } catch (err) {
            console.error(`Error running ${fns[index].name}:
                ${err}`)
        }
    }

    return api;
};

module.exports = easyBench;
