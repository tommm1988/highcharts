/* *
 *
 *  Imports
 *
 * */

import DataFrame from '/base/js/Data/DataFrame.js';
import DataTable from '/base/js/Data/DataTable.js';
import DataTableRow from '/base/js/Data/DataTableRow.js';
import * as Utilities from './utilities.js';

/* *
 *
 *  Constants
 *
 * */

const SAMPLE_SIZE = 100000;

/* *
 *
 *  Tests
 *
 * */

QUnit.test(
    'Benchmark: Convert series data to DataTable',
    function (assert) {
        const benchmark = [],
            benchmarkAverages = [];
        // array input
        let seriesData = Utilities
            .generateOHLCSeriesData(SAMPLE_SIZE)
            .map(Utilities.mapOHLCSeriesData);
        // convert
        Utilities.benchmark(benchmarkAverages);
        Utilities.benchmark(benchmark);
        let dataTable = new DataTable(
            seriesData.map(data => new DataTableRow({
                open: data[0],
                high: data[1],
                low: data[2],
                close: data[3]
            }))
        );
        // tests
        Utilities.benchmark(benchmark);
        assert.strictEqual(
            dataTable.getRowCount(),
            SAMPLE_SIZE
        );
        for (let i = 0, iEnd = dataTable.getRowCount(); i < iEnd; ++i) {
            assert.strictEqual(
                dataTable.getRowCell(i, 'open'),
                seriesData[i][0]
            );
        }
        // result
        Utilities.benchmark(benchmark);
        Utilities.benchmarkResult('DataTable array', benchmark);
        // reset
        seriesData.length = 0;
        dataTable.clear();
        benchmark.length = 0;
        // object input
        seriesData = Utilities.generateOHLCSeriesData(SAMPLE_SIZE);
        // convert
        Utilities.benchmark(benchmarkAverages);
        Utilities.benchmark(benchmark);
        dataTable = new DataTable(
            seriesData.map(data => new DataTableRow(data))
        );
        // tests
        Utilities.benchmark(benchmark);
        assert.strictEqual(
            dataTable.getRowCount(),
            SAMPLE_SIZE
        );
        for (let i = 0, iEnd = dataTable.getRowCount(); i < iEnd; ++i) {
            assert.strictEqual(
                dataTable.getRowCell(i, 'open'),
                seriesData[i].open
            );
        }
        Utilities.benchmark(benchmark);
        Utilities.benchmarkResult('DataTable object', benchmark);
        Utilities.benchmark(benchmarkAverages);
        Utilities.benchmarkResult('DataTable', benchmarkAverages);
    }
);

QUnit.test(
    'Benchmark: Convert series data to DataFrame',
    function (assert) {
        const benchmark = [],
            benchmarkAverages = [];
        // array input
        let seriesData = Utilities
            .generateOHLCSeriesData(SAMPLE_SIZE)
            .map(Utilities.mapOHLCSeriesData);
        // convert
        Utilities.benchmark(benchmarkAverages);
        Utilities.benchmark(benchmark);
        let frameColumns = { open: [], high: [], low: [], close: [] };
        let columnNames = Object.keys(frameColumns);
        for (let i = 0, iEnd = seriesData.length; i < iEnd; ++i) {
            for (let j = 0, jEnd = 4; j < jEnd; ++j) {
                frameColumns[columnNames[j]][i] = seriesData[i][j];
            }
        }
        let dataFrame = new DataFrame(frameColumns);
        // tests
        Utilities.benchmark(benchmark);
        assert.strictEqual(
            dataFrame.getRowCount(),
            SAMPLE_SIZE
        );
        for (let i = 0, iEnd = dataFrame.getRowCount(); i < iEnd; ++i) {
            assert.strictEqual(
                dataFrame.getRowCell(i, 'open'),
                seriesData[i][0]
            );
        }
        // result
        Utilities.benchmark(benchmark);
        Utilities.benchmarkResult('DataFrame array', benchmark);
        // reset
        seriesData.length = 0;
        frameColumns = {};
        dataFrame.clear();
        benchmark.length = 0;
        // object input
        seriesData = Utilities.generateOHLCSeriesData(SAMPLE_SIZE);
        // convert
        Utilities.benchmark(benchmarkAverages);
        Utilities.benchmark(benchmark);
        frameColumns = { open: [], high: [], low: [], close: [] };
        for (let i = 0, iEnd = seriesData.length; i < iEnd; ++i) {
            for (let j = 0, jEnd = 4; j < jEnd; ++j) {
                frameColumns[columnNames[j]][i] = seriesData[i][columnNames[j]];
            }
        }
        dataFrame = new DataFrame(frameColumns);
        // tests
        Utilities.benchmark(benchmark);
        assert.strictEqual(
            dataFrame.getRowCount(),
            SAMPLE_SIZE
        );
        for (let i = 0, iEnd = dataFrame.getRowCount(); i < iEnd; ++i) {
            assert.strictEqual(
                dataFrame.getRowCell(i, 'open'),
                seriesData[i].open
            );
        }
        Utilities.benchmark(benchmark);
        Utilities.benchmarkResult('DataFrame object', benchmark);
        Utilities.benchmark(benchmarkAverages);
        Utilities.benchmarkResult('DataFrame', benchmarkAverages);
    }
);
