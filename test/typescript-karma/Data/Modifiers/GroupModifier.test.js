import DataPromise from '/base/js/Data/DataPromise.js';
import DataTable from '/base/js/Data/DataTable.js';
import GroupModifier from '/base/js/Data/Modifiers/GroupModifier.js';

QUnit.test('GroupModifier.modifyTable', function (assert) {

    const done = assert.async(),
        modifier = new GroupModifier({
            groupColumn: 'y'
        });

    DataPromise.onlyPolyfill = true;
    DataPromise
        .resolve(new DataTable({
            x: [ 0, 0, 1, 1 ],
            y: [ 'a', 'b', 'b', 'a']
        }))
        .then((table) =>
            modifier.modifyTable(table)
        )
        .then((table) => {
            assert.ok(
                table.modified.getCell('table', 0) instanceof DataTable,
                'Modified table should contain subtables.'
            );

            assert.deepEqual(
                table.modified.getCell('table', 0).getColumns(['x', 'y']),
                {
                    x: [0, 1],
                    y: ['a', 'a']
                },
                'Modified table should have subtables. (#1)'
            );

            assert.deepEqual(
                table.modified.getCell('table', 1).getColumns(['x', 'y']),
                {
                    x: [0, 1],
                    y: ['b', 'b']
                },
                'Modified table should have subtables. (#1)'
            );
        })
        .catch((e) =>
            assert.notOk(true, e)
        )
        .then(() =>
            done()
        );

});

QUnit.test('GroupModifier.modifyCell', function (assert) {

    const done = assert.async(),
        modifier = new GroupModifier({
            groupColumn: 'y'
        });

    DataPromise.onlyPolyfill = true;
    DataPromise
        .resolve(new DataTable({
            x: [ 0, 0, 1, 1 ],
            y: [ 'a', 'b', 'b', 'a']
        }))
        .then((table) =>
            table.setModifier(modifier)
        )
        .then((table) => {
            assert.ok(
                table.modified.getCell('table', 0) instanceof DataTable,
                'Modified table should contain subtables.'
            );
            assert.strictEqual(
                table.modified.getCell('table', 0).getCell('x', 0),
                0,
                'Subtable should contain valid x value.'
            );
            return table;
        })
        .then((table) =>
            table.setCell('x', 0, 10)
        )
        .then((table) => {
            assert.strictEqual(
                table.modified.getCell('table', 0).getCell('x', 0),
                10,
                'Subtable should contain valid x value.'
            );
            return table;
        })
        .catch((e) =>
            assert.notOk(true, e)
        )
        .then(() =>
            done()
        );

});

QUnit.test('GroupModifier.modifyColumns', function (assert) {

    const done = assert.async(),
        modifier = new GroupModifier({
            groupColumn: 'y'
        });

    DataPromise.onlyPolyfill = true;
    DataPromise
        .resolve(new DataTable({
            x: [ 0, 0, 1, 1 ],
            y: [ 'a', 'b', 'b', 'a']
        }))
        .then((table) =>
            table.setModifier(modifier)
        )
        .then((table) => {
            assert.ok(
                table.modified.getCell('table', 0) instanceof DataTable,
                'Modified table should contain subtables.'
            );
            assert.strictEqual(
                table.modified.getCell('table', 0).getCell('x', 0),
                0,
                'Subtable should contain valid x value.'
            );
            return table;
        })
        .then((table) =>
            table.setColumns({
                'x': [4, 3, 2, 1]
            })
        )
        .then((table) => {
            assert.deepEqual(
                table.modified.getCell('table', 0).getColumn('x'),
                [4, 1],
                'Subtable should contain valid x value.'
            );
            return table;
        })
        .catch((e) =>
            assert.notOk(true, e)
        )
        .then(() =>
            done()
        );

});

QUnit.test('GroupModifier.modifyRows', function (assert) {

    const done = assert.async(),
        modifier = new GroupModifier({
            groupColumn: 'y'
        });

    DataPromise.onlyPolyfill = true;
    DataPromise
        .resolve(new DataTable({
            x: [ 0, 0, 1, 1 ],
            y: [ 'a', 'b', 'b', 'a']
        }))
        .then((table) =>
            table.setModifier(modifier)
        )
        .then((table) => {
            assert.ok(
                table.modified.getCell('table', 0) instanceof DataTable,
                'Modified table should contain subtables.'
            );
            assert.strictEqual(
                table.modified.getCell('table', 0).getCell('x', 0),
                0,
                'Subtable should contain valid x value.'
            );
            return table;
        })
        .then((table) =>
            table.setRows([{ x: 5, y: 'c' }], 1)
        )
        .then((table) => {
            assert.strictEqual(
                table.modified.getCell('table', 1).getCell('x', 0),
                5,
                'Subtable should contain valid x value.'
            );
            return table;
        })
        .catch((e) =>
            assert.notOk(true, e)
        )
        .then(() =>
            done()
        );

});
