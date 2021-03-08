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
        Utilities.benchmark(benchmark);
        Utilities.benchmark(benchmarkAverages);
        // convert
        let columnNames = ['open', 'high', 'low', 'close'];
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
        Utilities.benchmark(benchmarkAverages);
        assert.strictEqual(
            dataTable.getRowCount(),
            SAMPLE_SIZE
        );
        for (let i = 0, iEnd = dataTable.getRowCount(); i < iEnd; ++i) {
            assert.ok(dataTable.getRowCell(i, 'open'));
        }
        Utilities.benchmark(benchmark);
        for (let i = 0, iEnd = columnNames.length; i < iEnd; ++i) {
            assert.ok(dataTable.getColumn(columnNames[i]));
        }
        Utilities.benchmark(benchmark);
        for (let i = 0, iEnd = dataTable.getRowCount(); i < iEnd; ++i) {
            assert.ok(dataTable.getRow(i));
        }
        // result
        Utilities.benchmark(benchmark);
        Utilities.benchmarkResult('DataTable array', benchmark);
        Utilities.benchmark(benchmarkAverages);
        // reset
        seriesData.length = 0;
        dataTable.clear();
        benchmark.length = 0;
        // object input
        seriesData = Utilities.generateOHLCSeriesData(SAMPLE_SIZE);
        // convert
        dataTable = new DataTable(
            seriesData.map(data => new DataTableRow(data))
        );
        // tests
        Utilities.benchmark(benchmark);
        Utilities.benchmark(benchmarkAverages);
        assert.strictEqual(
            dataTable.getRowCount(),
            SAMPLE_SIZE
        );
        for (let i = 0, iEnd = dataTable.getRowCount(); i < iEnd; ++i) {
            assert.ok(dataTable.getRowCell(i, 'open'));
        }
        Utilities.benchmark(benchmark);
        for (let i = 0, iEnd = columnNames.length; i < iEnd; ++i) {
            assert.ok(dataTable.getColumn(columnNames[i]));
        }
        Utilities.benchmark(benchmark);
        for (let i = 0, iEnd = dataTable.getRowCount(); i < iEnd; ++i) {
            assert.ok(dataTable.getRow(i));
        }
        // generic tests
        Utilities.benchmark(benchmark);
        Utilities.benchmark(benchmarkAverages);
        assert.strictEqual(
            Object.keys(dataTable.getColumns()).length,
            columnNames.length + 1
        );
        assert.strictEqual(
            dataTable.getAllRows().length,
            seriesData.length
        );
        // result
        Utilities.benchmark(benchmark);
        Utilities.benchmarkResult('DataTable object', benchmark);
        // final
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
        Utilities.benchmark(benchmark);
        Utilities.benchmark(benchmarkAverages);
        // convert
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
        Utilities.benchmark(benchmarkAverages);
        assert.strictEqual(
            dataFrame.getRowCount(),
            SAMPLE_SIZE
        );
        for (let i = 0, iEnd = dataFrame.getRowCount(); i < iEnd; ++i) {
            assert.ok(dataFrame.getRowCell(i, 'open'))
        }
        Utilities.benchmark(benchmark);
        for (let i = 0, iEnd = columnNames.length; i < iEnd; ++i) {
            assert.ok(dataFrame.getColumn(columnNames[i]));
        }
        Utilities.benchmark(benchmark);
        for (let i = 0, iEnd = dataFrame.getRowCount(); i < iEnd; ++i) {
            assert.ok(dataFrame.getRow(i));
        }
        // result
        Utilities.benchmark(benchmark);
        Utilities.benchmarkResult('DataFrame array', benchmark);
        Utilities.benchmark(benchmarkAverages);
        // reset
        seriesData.length = 0;
        frameColumns = {};
        dataFrame.clear();
        benchmark.length = 0;
        // object input
        seriesData = Utilities.generateOHLCSeriesData(SAMPLE_SIZE);
        // convert
        frameColumns = { open: [], high: [], low: [], close: [] };
        for (let i = 0, iEnd = seriesData.length; i < iEnd; ++i) {
            for (let j = 0, jEnd = 4; j < jEnd; ++j) {
                frameColumns[columnNames[j]][i] = seriesData[i][columnNames[j]];
            }
        }
        dataFrame = new DataFrame(frameColumns);
        // tests
        Utilities.benchmark(benchmark);
        Utilities.benchmark(benchmarkAverages);
        assert.strictEqual(
            dataFrame.getRowCount(),
            SAMPLE_SIZE
        );
        for (let i = 0, iEnd = dataFrame.getRowCount(); i < iEnd; ++i) {
            assert.ok(dataFrame.getRowCell(i, 'open'));
        }
        Utilities.benchmark(benchmark);
        for (let i = 0, iEnd = columnNames.length; i < iEnd; ++i) {
            assert.ok(dataFrame.getColumn(columnNames[i]));
        }
        Utilities.benchmark(benchmark);
        for (let i = 0, iEnd = dataFrame.getRowCount(); i < iEnd; ++i) {
            assert.ok(dataFrame.getRow(i));
        }
        // generic tests
        Utilities.benchmark(benchmark);
        Utilities.benchmark(benchmarkAverages);
        assert.strictEqual(
            Object.keys(dataFrame.getAllColumns()).length,
            columnNames.length
        );
        assert.strictEqual(
            dataFrame.getAllRows().length,
            seriesData.length
        );
        // result
        Utilities.benchmark(benchmark);
        Utilities.benchmarkResult('DataFrame object', benchmark);
        // final
        Utilities.benchmark(benchmarkAverages);
        Utilities.benchmarkResult('DataFrame', benchmarkAverages);
    }
);
