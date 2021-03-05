/* *
 *
 *  Functions
 *
 * */

/**
 * Creates or adds a benchmark.
 *
 * @param {Array<number>} [previousBenchmark]
 * Previous benchmark to add to.
 *
 * @return {Array<number>|undefined}
 * New benchmark, if no previous benchmark provided.
 */
export function benchmark(previousBenchmark) {
    if (!previousBenchmark) {
        return [window.performance.now()];
    } else {
        previousBenchmark.push(window.performance.now());
    }
}


/**
 * Calculates average benchmark time from time samples.
 *
 * @param {string} description
 * Benchmark description.
 *
 * @param {Array<number>} benchmark
 * Benchmark time samples.
 *
 * @return {number}
 * Average benchmark time.
 */
export function benchmarkResult(description, benchmark) {
    const benchmarkLength = benchmark.length;

    let mark,
        totalTime = 0;

    for (let i = 1; i < benchmarkLength; ++i) {
        mark = (benchmark[i] - benchmark[i-1]);
        console.log(`${description} #${i}: ${mark}`);
        totalTime += mark;
    }

    const average = (totalTime / (benchmarkLength - 1));

    console.log(`${description} ~: ${average}`);

    return average;
}

/**
 * Generates series data in OHLC format.
 *
 * @param {number} numberOfPoints
 * Number of series data points.
 *
 * @return {Array<Record<string, number>>}
 * OHLC series data.
 */
export function generateOHLCSeriesData(numberOfPoints) {
    const seriesData = [];

    for (let i = 0, iEnd = numberOfPoints, y; i < iEnd; ++i) {
        y = ((Math.random() * 100) + i);
        seriesData.push({
            open: (y - 1.1),
            high: (y + 2.2),
            low: (y - 2.2),
            close: (y + 1.1)
        });
    }

    return seriesData;
}

/**
 * Maps series data in OHLC format to array.
 *
 * @param {Array<Record<string, number>>} data
 * OHLC series data as data points.
 *
 * @return {Array<Array<number>>}
 * OHLC series data as array.
 */
export function mapOHLCSeriesData(data) {
    return [data.open, data.high, data.low, data.close];
}
