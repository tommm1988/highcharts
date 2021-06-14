import DataPromise from '/base/js/Data/DataPromise.js';
import DataTable from '/base/js/Data/DataTable.js';
import ChainModifier from '/base/js/Data/Modifiers/ChainModifier.js';
import GroupModifier from '/base/js/Data/Modifiers/GroupModifier.js';
import RangeModifier from '/base/js/Data/Modifiers/RangeModifier.js';
import SortModifier from '/base/js/Data/Modifiers/SortModifier.js';

QUnit.test('ChainModifier.benchmark', function (assert) {
    const done = assert.async(),
        options = {
            iterations: 10
        },
        modifier = new ChainModifier(
            {},
            new GroupModifier({
                groupColumn: 'y'
            }),
            new RangeModifier({
                ranges: [{
                    column: 'value',
                    minValue: 'A',
                    maxValue: 'b'
                }]
            })
        ),
        table = new DataTable();

    DataPromise.onlyPolyfill = true;
    DataPromise
        .resolve(assert.expect(1))
        .then(() =>
            table.setRows([{
                x: 1,
                y: 'a'
            }, {
                x: 2,
                y: 'a'
            }, {
                x: 3,
                y: 'b'
            }, {
                x: 4,
                y: 'b'
            }, {
                x: 5,
                y: 'c'
            }, {
                x: 6,
                y: 'c'
            }])
        )
        .then(() =>
            modifier.benchmark(table, options)
        )
        .then((result) => {
            assert.strictEqual(
                result.length,
                options.iterations,
                'Ran for correct amount of iterations'
            );
        })
        .catch((e) => {
            console.log(e);
            assert.notOk(true);
        })
        .then(() =>
            done()
        );
});

QUnit.test('ChainModifier.modifyTable', function (assert) {
    const done = assert.async(),
        modifier = new ChainModifier(
            {},
            new GroupModifier({
                groupColumn: 'y'
            }),
            new RangeModifier({
                ranges: [{
                    column: 'value',
                    minValue: 'A',
                    maxValue: 'b'
                }]
            })
        ),
        table = new DataTable({
            x: [1, 2, 3, 4, 5, 6],
            y: ['a', 'a', 'b', 'b', 'c', 'c']
        });
    console.log(0);
    DataPromise
        .resolve(assert.expect(2))
        .then(() => {
            console.log(1);
            modifier.modifyTable(table)
        })
        .then(() => {
            console.log(2);
            assert.equal(
                table.modified.getRowCount(),
                2,
                'Modified table should contain two rows, one for each group.'
            );
            assert.deepEqual(
                table.modified.toJSON(),
                {
                    $class: 'DataTable',
                    columns: {
                        groupBy: ['y', 'y'],
                        table: [{
                            $class: 'DataTable',
                            columns: {
                                x: [1, 2],
                                y: ['a', 'a']
                            }
                        }, {
                            $class: 'DataTable',
                            columns: {
                                x: [3, 4],
                                y: ['b', 'b']
                            }
                        }],
                        value: ['a', 'b']
                    }
                },
                'Modified table should have expected structure of two rows with sub tables.'
            );
            done();
        })
        .catch((e) => {
            console.log(e);
            assert.notOk(true);
        });
});

QUnit.test('ChainModifier.modifyCell', function (assert) {
    const table = new DataTable({
        x: [1, 2, 3, 4, 5, 6]
    });

    table.setModifier(new ChainModifier({
            columns: ['x', 'y']
        },
        new RangeModifier({
            ranges: [{
                column: 'x',
                minValue: 2,
                maxValue: 5
            }]
        }),
        new SortModifier({
            direction: 'desc',
            sortByColumn: 'x',
        })
    ));

    assert.strictEqual(
        table.getRowCount(),
        6,
        'DataTable should contain six rows.'
    );

    assert.strictEqual(
        table.modified.getRowCount(),
        4,
        'DataTable.modified should contain four rows.'
    );

    table.setCell('x', 2, 0);

    assert.strictEqual(
        table.getRowCount(),
        6,
        'DataTable should contain six rows.'
    );

    assert.strictEqual(
        table.modified.getRowCount(),
        3,
        'DataTable.modified should contain three rows.'
    );

});

QUnit.test('ChainModifier.modifyColumns', function (assert) {
    const table = new DataTable({
        x: [1, 2, 3, 4, 5, 6]
    });

    table.setModifier(new ChainModifier({
            columns: ['x', 'y']
        },
        new RangeModifier({
            ranges: [{
                column: 'x',
                minValue: 2,
                maxValue: 5
            }]
        }),
        new SortModifier({
            direction: 'desc',
            sortByColumn: 'x',
        })
    ));

    assert.strictEqual(
        table.getRowCount(),
        6,
        'DataTable should contain six rows.'
    );

    assert.strictEqual(
        table.modified.getRowCount(),
        4,
        'DataTable.modified should contain four rows.'
    );

    table.setColumn('x', [8, 3, 7, 4, 6, 5]);

    assert.strictEqual(
        table.getRowCount(),
        6,
        'DataTable should contain six rows.'
    );

    assert.strictEqual(
        table.modified.getRowCount(),
        3,
        'DataTable.modified should contain three rows.'
    );

});


QUnit.test('ChainModifier.modifyRows', function (assert) {
    const table = new DataTable({
        x: [6, 5, 4, 3, 2, 1],
        ignoredColumn: ['a', 'b', 'c', 'd', 'e', 'f']
    });

    table.setModifier(new ChainModifier({
            columns: ['x', 'y']
        },
        new RangeModifier({
            ranges: [{
                column: 'x',
                minValue: 2,
                maxValue: 5
            }]
        }),
        new SortModifier({
            direction: 'asc',
            sortByColumn: 'x',
        })
    ));

    assert.strictEqual(
        table.getRowCount(),
        6,
        'DataTable should contain six rows.'
    );

    assert.strictEqual(
        table.modified.getRowCount(),
        4,
        'DataTable.modified should contain four rows.'
    );

    table.setRows([{ x: 1 }, { ignoredColumn: 'z' }, { x: 5 }], 4);

    assert.strictEqual(
        table.getRowCount(),
        7,
        'DataTable should contain seven rows.'
    );

    assert.strictEqual(
        table.modified.getRowCount(),
        4,
        'DataTable.modified should contain three rows.'
    );

});
