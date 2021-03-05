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
        // array input
        let seriesData = Utilities
            .generateOHLCSeriesData(SAMPLE_SIZE)
            .map(Utilities.mapOHLCSeriesData);
        console.log('DataTable benchmark #1');
        let startTime = window.performance.now();
        // convert
        let dataTable = new DataTable(
            seriesData.map(data => new DataTableRow({
                open: data[0],
                high: data[1],
                low: data[2],
                close: data[3]
            }))
        );
        // tests
        assert.strictEqual(
            dataTable.getRowCount(),
            SAMPLE_SIZE
        );/*
        for (let i = 0, iEnd = dataTable.getRowCount(); i < iEnd; ++i) {
            assert.strictEqual(
                dataTable.getRowCell(i, 'open'),
                seriesData[i][0]
            );
        }*/
        let endTime = window.performance.now();
        let benchmarks = [endTime - startTime];
        console.log(`DataTable time #1: ${benchmarks[benchmarks.length-1]}`);
        // reset
        seriesData.length = 0;
        startTime = 0;
        dataTable.clear();
        endTime = 0;
        // object input
        seriesData = Utilities.generateOHLCSeriesData(SAMPLE_SIZE);
        console.log('DataTable benchmark #2');
        startTime = window.performance.now();
        // convert
        dataTable = new DataTable(
            seriesData.map(data => new DataTableRow(data))
        );
        // tests
        assert.strictEqual(
            dataTable.getRowCount(),
            SAMPLE_SIZE
        );/*
        for (let i = 0, iEnd = dataTable.getRowCount(); i < iEnd; ++i) {
            assert.strictEqual(
                dataTable.getRowCell(i, 'open'),
                seriesData[i].open
            );
        }*/
        endTime = window.performance.now();
        benchmarks.push(endTime - startTime);
        console.log(`DataTable time #2: ${benchmarks[benchmarks.length-1]}`);
        // result
        console.log(`DataTable ~time: ${Utilities.getBenchmarkTime(benchmarks)}`);
    }
);

QUnit.test(
    'Benchmark: Convert series data to DataFrame',
    function (assert) {
        // array input
        let seriesData = Utilities
            .generateOHLCSeriesData(SAMPLE_SIZE)
            .map(Utilities.mapOHLCSeriesData);
        console.log('DataFrame benchmark #1');
        let startTime = window.performance.now();
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
        let endTime = window.performance.now();
        let benchmarks = [endTime - startTime];
        console.log(`DataFrame time #1: ${benchmarks[benchmarks.length-1]}`);
        // reset
        seriesData.length = 0;
        startTime = 0;
        frameColumns = {};
        dataFrame.clear();
        endTime = 0;
        // object input
        seriesData = Utilities.generateOHLCSeriesData(SAMPLE_SIZE);
        console.log('DataFrame benchmark #2');
        startTime = window.performance.now();
        // convert
        frameColumns = { open: [], high: [], low: [], close: [] };
        for (let i = 0, iEnd = seriesData.length; i < iEnd; ++i) {
            for (let j = 0, jEnd = 4; j < jEnd; ++j) {
                frameColumns[columnNames[j]][i] = seriesData[i][columnNames[j]];
            }
        }
        dataFrame = new DataFrame(frameColumns);
        // tests
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
        endTime = window.performance.now();
        benchmarks.push(endTime - startTime);
        console.log(`DataFrame time #2: ${benchmarks[benchmarks.length-1]}`);
        // result
        console.log(`DataFrame ~time: ${Utilities.getBenchmarkTime(benchmarks)}`);
    }
);
