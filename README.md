# easy-bench
Easy to use js benchmarking function

const bench = easyBench('My Benchmark');
bench.add('case1', fn1);
bench.add('case2', fn2);
bench.add('case3', fn3);
bench.add('case4', fn4);

bench.run(2000); <- run accepts the amount of times you wish each case to be run
