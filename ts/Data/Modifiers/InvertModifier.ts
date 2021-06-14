/* *
 *
 *  Data Layer
 *
 *  (c) 2012-2020 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */

'use strict';

/* *
 *
 *  Imports
 *
 * */

import type DataEventEmitter from '../DataEventEmitter';

import DataModifier from './DataModifier.js';
import DataJSON from '../DataJSON.js';
import DataPromise from '../DataPromise';
import DataTable from '../DataTable.js';
import U from '../../Core/Utilities.js';
const { merge } = U;

/* *
 *
 *  Class
 *
 * */

/**
 * Inverts columns and rows in a table.
 *
 * @private
 */
class InvertModifier extends DataModifier {

    /* *
     *
     *  Static Properties
     *
     * */

    /**
     * Default options for the invert modifier.
     */
    public static readonly defaultOptions: InvertModifier.Options = {
        modifier: 'InvertModifier'
    };

    /* *
     *
     *  Static Functions
     *
     * */

    /**
     * Converts a class JSON to a invert modifier.
     *
     * @param {InvertModifier.ClassJSON} json
     * Class JSON to convert to an instance of invert modifier.
     *
     * @return {InvertModifier}
     * Series points modifier of the class JSON.
     */
    public static fromJSON(json: InvertModifier.ClassJSON): InvertModifier {
        return new InvertModifier(json.options);
    }

    /* *
     *
     *  Constructor
     *
     * */

    /**
     * Constructs an instance of the invert modifier.
     *
     * @param {InvertModifier.Options} [options]
     * Options to configure the invert modifier.
     */
    public constructor(options?: DeepPartial<InvertModifier.Options>) {
        super();

        this.options = merge(InvertModifier.defaultOptions, options);
    }

    /* *
     *
     *  Properties
     *
     * */

    /**
     * Options of the invert modifier.
     */
    public options: InvertModifier.Options;

    /* *
     *
     *  Functions
     *
     * */

    /**
     * Applies partial modifications of a cell change to the property `modified`
     * of the given modified table.
     *
     * @param {Highcharts.DataTable} table
     * Modified table.
     *
     * @param {string} columnName
     * Column name of changed cell.
     *
     * @param {number|undefined} rowIndex
     * Row index of changed cell.
     *
     * @param {Highcharts.DataTableCellType} cellValue
     * Changed cell value.
     *
     * @param {Highcharts.DataTableEventDetail} [eventDetail]
     * Custom information for pending events.
     *
     * @return {Promise<Highcharts.DataTable>}
     * Modified table as a reference.
     */
    public modifyCell<T extends DataTable>(
        table: T,
        columnName: string,
        rowIndex: number,
        cellValue: DataTable.CellType,
        eventDetail?: DataEventEmitter.EventDetail
    ): DataPromise<T> {
        return DataPromise
            .resolve(this)
            .then((modifier): DataPromise<T> => {
                const modified = table.modified,
                    modifiedRowIndex = modified.getRowIndexBy('columnNames', columnName);

                if (typeof modifiedRowIndex === 'undefined') {
                    return modifier.modifyTable(table);
                }

                return modified
                    .setCell(
                        `${rowIndex}`,
                        modifiedRowIndex,
                        cellValue,
                        eventDetail
                    )
                    .then((): T =>
                        table
                    );
            });
    }

    /**
     * Applies partial modifications of column changes to the property
     * `modified` of the given table.
     *
     * @param {Highcharts.DataTable} table
     * Modified table.
     *
     * @param {Highcharts.DataTableColumnCollection} columns
     * Changed columns as a collection, where the keys are the column names.
     *
     * @param {number} [rowIndex=0]
     * Index of the first changed row.
     *
     * @param {Highcharts.DataTableEventDetail} [eventDetail]
     * Custom information for pending events.
     *
     * @return {Promise<Highcharts.DataTable>}
     * Modified table as a reference.
     */
    public modifyColumns<T extends DataTable>(
        table: T,
        columns: DataTable.ColumnCollection,
        rowIndex: number,
        eventDetail?: DataEventEmitter.EventDetail
    ): DataPromise<T> {
        return DataPromise
            .resolve(this)
            .then((modifier): DataPromise<T> => {
                const modified = table.modified,
                    modifiedColumnNames = modified.getColumnNames();

                let columnNames = table.getColumnNames(),
                    reset = (columnNames.length !== modifiedColumnNames.length);

                if (!reset) {
                    for (let i = 0, iEnd = columnNames.length; i < iEnd; ++i) {
                        if (columnNames[i] !== modifiedColumnNames[i]) {
                            reset = true;
                            break;
                        }
                    }
                }

                if (reset) {
                    return modifier.modifyTable(table);
                }

                let promise = DataPromise.resolve(modified);

                columnNames = Object.keys(columns);

                for (
                    let i = 0,
                        iEnd = columnNames.length,
                        column: DataTable.Column,
                        columnName: string,
                        modifiedRowIndex: number;
                    i < iEnd;
                    ++i
                ) {
                    columnName = columnNames[i];
                    column = columns[columnName];
                    modifiedRowIndex = (
                        modified.getRowIndexBy('columnNames', columnName) ||
                        modified.getRowCount()
                    );

                    for (
                        let j = 0,
                            j2 = rowIndex,
                            jEnd = column.length;
                        j < jEnd;
                        ++j, ++j2
                    ) {
                        promise = promise.then((modified): DataPromise<DataTable> =>
                            modified.setCell(
                                `${j2}`,
                                modifiedRowIndex,
                                column[j],
                                eventDetail
                            )
                        );
                    }
                }

                return promise.then((): T => table);
            });
    }

    /**
     * Applies partial modifications of row changes to the property `modified`
     * of the given table.
     *
     * @param {Highcharts.DataTable} table
     * Modified table.
     *
     * @param {Array<(Highcharts.DataTableRow|Highcharts.DataTableRowObject)>} rows
     * Changed rows.
     *
     * @param {number} [rowIndex]
     * Index of the first changed row.
     *
     * @param {Highcharts.DataTableEventDetail} [eventDetail]
     * Custom information for pending events.
     *
     * @return {Promise<Highcharts.DataTable>}
     * Modified table as a reference.
     */
    public modifyRows<T extends DataTable>(
        table: T,
        rows: Array<(DataTable.Row|DataTable.RowObject)>,
        rowIndex: number,
        eventDetail?: DataEventEmitter.EventDetail
    ): DataPromise<T> {
        return DataPromise
            .resolve(this)
            .then((modifier): DataPromise<T> => {
                const columnNames = table.getColumnNames(),
                    modified = table.modified,
                    modifiedColumnNames = modified.getColumnNames();

                let reset = (columnNames.length !== modifiedColumnNames.length);

                if (!reset) {
                    for (let i = 0, iEnd = columnNames.length; i < iEnd; ++i) {
                        if (columnNames[i] !== modifiedColumnNames[i]) {
                            reset = true;
                            break;
                        }
                    }
                }

                if (reset) {
                    return modifier.modifyTable(table);
                }

                let promise = DataPromise.resolve(modified);

                for (
                    let i = 0,
                        i2 = rowIndex,
                        iEnd = rows.length,
                        currentRow: (DataTable.Row|DataTable.RowObject),
                        row: DataTable.Row,
                        rowObject: DataTable.RowObject;
                    i < iEnd;
                    ++i, ++i2
                ) {
                    currentRow = rows[i];
                    if (currentRow instanceof Array) {
                        row = currentRow;
                        promise = promise.then((modified): DataPromise<DataTable> =>
                            modified.setColumn(
                                `${i2}`,
                                row,
                                void 0,
                                eventDetail
                            )
                        );
                    } else {
                        rowObject = currentRow;
                        for (let j = 0, jEnd = columnNames.length; j < jEnd; ++j) {
                            promise = promise.then((modified): DataPromise<DataTable> =>
                                modified.setCell(
                                    `${i2}`,
                                    j,
                                    rowObject[columnNames[j]],
                                    eventDetail
                                )
                            );
                        }
                    }
                }

                return promise.then((): T => table);
            });
    }

    /**
     * Sets the property `modified` of the given table with inverted rows and
     * columns.
     *
     * @param {Highcharts.DataTable} table
     * Table to modify.
     *
     * @param {Highcharts.DataTableEventDetail} [eventDetail]
     * Custom information for pending events.
     *
     * @return {Promise<Highcharts.DataTable>}
     * Modified table as a reference.
     */
    public modifyTable<T extends DataTable>(
        table: T,
        eventDetail?: DataEventEmitter.EventDetail
    ): DataPromise<T> {
        return DataPromise
            .resolve(this)
            .then((modifier): DataPromise<T> => {
                const columns: DataTable.ColumnCollection = {};

                modifier.emit({
                    type: 'modify',
                    detail: eventDetail,
                    table
                });

                if (table.hasColumns(['columnNames'])) { // inverted table
                    const columnNames: Array<string> = (
                        table.getColumn('columnNames') || []
                    ).map(
                        (column): string => `${column}`
                    );

                    for (
                        let i = 0,
                            iEnd = table.getRowCount(),
                            row: (DataTable.Row|undefined);
                        i < iEnd;
                        ++i
                    ) {
                        row = table.getRow(i);
                        if (row) {
                            columns[columnNames[i]] = row;
                        }
                    }
                } else { // regular table
                    for (
                        let i = 0,
                            iEnd = table.getRowCount(),
                            row: (DataTable.Row|undefined);
                        i < iEnd;
                        ++i
                    ) {
                        row = table.getRow(i);
                        if (row) {
                            columns[`${i}`] = row;
                        }
                    }
                    columns.columnNames = table.getColumnNames();
                }

                table.modified = table.clone(true, eventDetail);

                return table.modified
                    .setColumns(columns)
                    .then((): T => {
                        modifier.emit({
                            type: 'afterModify',
                            detail: eventDetail,
                            table
                        });

                        return table;
                    });
            });
    }

    /**
     * Converts the invert modifier to a class JSON,
     * including all containing all modifiers.
     *
     * @return {DataJSON.ClassJSON}
     * Class JSON of this invert modifier.
     */
    public toJSON(): InvertModifier.ClassJSON {
        return {
            $class: 'InvertModifier',
            options: merge(this.options)
        };
    }
}

/* *
 *
 *  Namespace
 *
 * */

/**
 * Additionally provided types for modifier events and options, and JSON
 * conversion.
 */
namespace InvertModifier {

    /**
     * Interface of the class JSON to convert to modifier instances.
     */
    export interface ClassJSON extends DataModifier.ClassJSON {
        // nothing here yet
    }

    /**
     * Options to configure the modifier.
     */
    export interface Options extends DataModifier.Options {
        // nothing here yet
    }
}

/* *
 *
 *  Register
 *
 * */

DataJSON.addClass(InvertModifier);
DataModifier.addModifier(InvertModifier);

declare module './ModifierType' {
    interface ModifierTypeRegistry {
        Invert: typeof InvertModifier;
    }
}

/* *
 *
 *  Export
 *
 * */

export default InvertModifier;
