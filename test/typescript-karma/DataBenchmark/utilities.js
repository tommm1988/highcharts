/* *
 *
 *  Functions
 *
 * */

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
 * Calculates average benchmark time from time samples.
 *
 * @param {Array<number>} benchmarks
 * Benchmark time samples.
 *
 * @return {number}
 * Average benchmark time.
 */
export function getBenchmarkTime(benchmarks) {
    const benchmarksLength = benchmarks.length;

    let totalTime = 0;

    for (let i = 0, iEnd = benchmarksLength; i < iEnd; ++i) {
        totalTime += benchmarks[i];
    }

    return (totalTime / benchmarksLength);
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
