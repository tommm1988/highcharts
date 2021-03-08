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
        const benchmark = [];
        const objectData = Utilities.generateOHLCSeriesData(SAMPLE_SIZE);
        const arrayData = objectData.map(Utilities.mapOHLCSeriesData);
        Utilities.benchmark(benchmark);
        // array init
        let columnNames = ['open', 'high', 'low', 'close'];
        let dataTable = new DataTable(
            arrayData.map(data => new DataTableRow({
                open: data[0],
                high: data[1],
                low: data[2],
                close: data[3]
            }))
        );
        assert.strictEqual(
            dataTable.getRowCount(),
            SAMPLE_SIZE
        );
        Utilities.benchmark(benchmark);
        // object init
        dataTable = new DataTable(
            objectData.map(data => new DataTableRow(data))
        );
        assert.strictEqual(
            dataTable.getRowCount(),
            SAMPLE_SIZE
        );
        Utilities.benchmark(benchmark);
        // tests
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
        Utilities.benchmark(benchmark);
        assert.strictEqual(
            Object.keys(dataTable.getColumns()).length,
            columnNames.length + 1
        );
        Utilities.benchmark(benchmark);
        assert.strictEqual(
            dataTable.getAllRows().length,
            objectData.length
        );
        Utilities.benchmark(benchmark);
        // result
        Utilities.benchmarkResult('DataTable', benchmark);
    }
);

QUnit.test(
    'Benchmark: Convert series data to DataFrame',
    function (assert) {
        const benchmark = [];
        const objectData = Utilities.generateOHLCSeriesData(SAMPLE_SIZE);
        const arrayData = objectData.map(Utilities.mapOHLCSeriesData);
        Utilities.benchmark(benchmark);
        // array init
        let frameColumns = { open: [], high: [], low: [], close: [] };
        let columnNames = Object.keys(frameColumns);
        for (let i = 0, iEnd = arrayData.length; i < iEnd; ++i) {
            for (let j = 0, jEnd = 4; j < jEnd; ++j) {
                frameColumns[columnNames[j]][i] = arrayData[i][j];
            }
        }
        let dataFrame = new DataFrame(frameColumns);
        assert.strictEqual(
            dataFrame.getRowCount(),
            SAMPLE_SIZE
        );
        Utilities.benchmark(benchmark);
        // object init
        frameColumns = { open: [], high: [], low: [], close: [] };
        for (let i = 0, iEnd = objectData.length; i < iEnd; ++i) {
            for (let j = 0, jEnd = 4; j < jEnd; ++j) {
                frameColumns[columnNames[j]][i] = objectData[i][columnNames[j]];
            }
        }
        dataFrame = new DataFrame(frameColumns);
        assert.strictEqual(
            dataFrame.getRowCount(),
            SAMPLE_SIZE
        );
        Utilities.benchmark(benchmark);
        // tests
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
        Utilities.benchmark(benchmark);
        assert.strictEqual(
            Object.keys(dataFrame.getAllColumns()).length,
            columnNames.length
        );
        Utilities.benchmark(benchmark);
        assert.strictEqual(
            dataFrame.getAllRows().length,
            objectData.length
        );
        Utilities.benchmark(benchmark);
        // final
        Utilities.benchmarkResult('DataFrame', benchmark);
    }
);
