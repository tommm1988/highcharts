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
import DataPromise from '../DataPromise.js';
import DataTable from '../DataTable.js';
import U from '../../Core/Utilities.js';
const { merge } = U;

/* *
 *
 *  Class
 *
 * */

/**
 * Sort table rows according to values of a column.
 *
 * @private
 */
class SortModifier extends DataModifier {

    /* *
     *
     *  Static Properties
     *
     * */

    /**
     * Default options to group table rows.
     */
    public static readonly defaultOptions: SortModifier.Options = {
        modifier: 'Order',
        direction: 'desc',
        orderByColumn: 'y'
    };

    /* *
     *
     *  Static Functions
     *
     * */

    private static ascending(
        a: DataTable.CellType,
        b: DataTable.CellType
    ): number {
        return (
            (a || 0) < (b || 0) ? -1 :
                (a || 0) > (b || 0) ? 1 :
                    0
        );
    }

    private static descending(
        a: DataTable.CellType,
        b: DataTable.CellType
    ): number {
        return (
            (b || 0) < (a || 0) ? -1 :
                (b || 0) > (a || 0) ? 1 :
                    0
        );
    }

    /* *
     *
     *  Constructor
     *
     * */

    /**
     * Constructs an instance of the range modifier.
     *
     * @param {RangeDataModifier.Options} [options]
     * Options to configure the range modifier.
     */
    public constructor(options?: DeepPartial<SortModifier.Options>) {
        super();

        this.options = merge(SortModifier.defaultOptions, options);
    }

    /* *
     *
     *  Properties
     *
     * */

    public options: SortModifier.Options;

    /* *
     *
     *  Functions
     *
     * */

    /**
     * Updates property `modified` of the given table with sorted rows and/or
     * columns.
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
     * Reference of `table.modified` with the additional modifications.
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
            .then((modifier): (T|DataPromise<T>) => {
                const {
                    orderByColumn,
                    orderInColumn
                } = modifier.options;

                if (columnName === orderByColumn) {
                    return DataPromise
                        .resolve(table.clone(true, eventDetail))
                        .then((sortedTable): DataPromise<DataTable> =>
                            sortedTable.setColumns(
                                table.getColumns(
                                    orderInColumn ?
                                        [orderByColumn, orderInColumn] :
                                        table.getColumnNames()
                                )
                            )
                        )
                        .then((sortedTable): DataPromise<DataTable> =>
                            modifier.modifyTable(sortedTable)
                        )
                        .then((sortedTable): DataPromise<DataTable> =>
                            table.modified.setColumns(
                                sortedTable.getColumns(),
                                void 0,
                                eventDetail
                            )
                        )
                        .then((): T =>
                            table
                        );
                }

                return table;
            });
    }

    /**
     * Updates property `modified` of the given table with sorted rows and/or
     * columns.
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
     * `table.modified` as a reference.
     */
    public modifyColumns<T extends DataTable>(
        table: T,
        columns: DataTable.ColumnCollection,
        rowIndex: number,
        eventDetail?: DataEventEmitter.EventDetail
    ): DataPromise<T> {
        return DataPromise
            .resolve(this)
            .then((modifier): (T|DataPromise<T>) => {
                const {
                        orderByColumn,
                        orderInColumn
                    } = modifier.options,
                    columnNames = Object.keys(columns);

                if (columnNames.indexOf(orderByColumn) > -1) {
                    return DataPromise
                        .resolve(table.clone(true, eventDetail))
                        .then((sortedTable): DataPromise<DataTable> =>
                            sortedTable.setColumns(
                                table.getColumns(
                                    orderInColumn ?
                                        [orderByColumn, orderInColumn] :
                                        table.getColumnNames()
                                )
                            )
                        )
                        .then((sortedTable): DataPromise<DataTable> =>
                            modifier.modifyTable(sortedTable)
                        )
                        .then((sortedTable): DataPromise<DataTable> =>
                            table.modified.setColumns(
                                sortedTable.getColumns(),
                                void 0,
                                eventDetail
                            )
                        )
                        .then((): T =>
                            table
                        );
                }

                return table;
            });
    }

    /**
     * Updates property `modified` of the given table with sorted rows and/or
     * columns.
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
     * `table.modified` as a reference.
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
                const {
                    orderByColumn,
                    orderInColumn
                } = modifier.options;

                return DataPromise
                    .resolve(table.clone(true, eventDetail))
                    .then((sortedTable): DataPromise<DataTable> =>
                        sortedTable.setColumns(
                            table.getColumns(
                                orderInColumn ?
                                    [orderByColumn, orderInColumn] :
                                    table.getColumnNames()
                            )
                        )
                    )
                    .then((sortedTable): DataPromise<DataTable> =>
                        modifier.modifyTable(sortedTable)
                    )
                    .then((sortedTable): DataPromise<DataTable> =>
                        table.modified.setColumns(sortedTable.getColumns())
                    )
                    .then((): T =>
                        table
                    );
            });
    }

    /**
     * Sets the property `modified` of the given table with sorted rows and/or
     * columns.
     *
     * @param {Highcharts.DataTable} table
     * Table to sort in.
     *
     * @param {Highcharts.DataTableEventDetail} [eventDetail]
     * Custom information for pending events.
     *
     * @return {Promise<Highcharts.DataTable>}
     * Sorted table as a reference.
     */
    public modifyTable<T extends DataTable>(
        table: T,
        eventDetail?: DataEventEmitter.EventDetail
    ): DataPromise<T> {
        return DataPromise
            .resolve(this)
            .then((modifier): DataPromise<T> => {
                const {
                        direction,
                        orderByColumn,
                        orderInColumn
                    } = modifier.options,
                    compare = (
                        direction === 'asc' ?
                            SortModifier.ascending :
                            SortModifier.descending
                    );

                modifier.emit({
                    type: 'modify',
                    detail: eventDetail,
                    table
                });

                const columnNames = table.getColumnNames(),
                    orderByColumnIndex = columnNames.indexOf(orderByColumn),
                    rowReferences = table
                        .getRows()
                        .map((row, index): SortModifier.RowReference => ({
                            index,
                            row
                        })),
                    rowCount = table.getRowCount();

                if (orderByColumnIndex !== -1) {
                    rowReferences.sort((a, b): number => compare(
                        a.row[orderByColumnIndex],
                        b.row[orderByColumnIndex]
                    ));
                }

                let promise = DataPromise.resolve(table.clone());

                if (orderInColumn) {
                    const column: DataTable.Column = [];
                    for (let i = 0; i < rowCount; ++i) {
                        column[rowReferences[i].index] = i;
                    }
                    promise = promise.then((clone): DataPromise<DataTable> =>
                        clone.setColumns({ [orderInColumn]: column })
                    );
                } else {
                    const rows: Array<DataTable.Row> = [];
                    for (let i = 0; i < rowCount; ++i) {
                        rows.push(rowReferences[i].row);
                    }
                    promise = promise.then((clone): DataPromise<DataTable> =>
                        clone.setRows(rows, 0)
                    );
                }

                return promise.then((clone): T => {
                    table.modified = clone;
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
     * Converts the sort modifier to a class JSON.
     *
     * @return {DataJSON.ClassJSON}
     * Class JSON of this sort modifier.
     */
    public toJSON(): SortModifier.ClassJSON {
        return {
            $class: 'SortModifier',
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
namespace SortModifier {

    /**
     * Interface of the class JSON to convert to modifier instances.
     */
    export interface ClassJSON extends DataModifier.ClassJSON {
        options: Options;
    }

    /**
     * Options to configure the modifier.
     */
    export interface Options extends DataModifier.Options {

        /**
         * Direction of sorting.
         *
         * @default "desc"
         */
        direction: ('asc'|'desc');

        /**
         * Column with values to order.
         *
         * @default "y"
         */
        orderByColumn: string;

        /**
         * Column to update with order index instead of change order of rows.
         */
        orderInColumn?: string;

    }

    /** @private */
    export interface RowReference {
        index: number;
        row: DataTable.Row;
    }

}

/* *
 *
 *  Default Export
 *
 * */

export default SortModifier;
