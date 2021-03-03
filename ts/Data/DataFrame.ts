import type DataEventEmitter from './DataEventEmitter';

import DataConverter from './DataConverter.js';
import DataJSON from './DataJSON.js';
import DataPresentationState from './DataPresentationState.js';
import U from '../Core/Utilities.js';
const {
    addEvent,
    fireEvent,
    merge,
    uniqueKey
} = U;

class DataFrame implements DataEventEmitter<DataFrame.EventObject> {

    /* *
     *
     *  Constructors
     *
     * */

    public constructor(
        columnNames: Array<string> = [],
        columns: Array<DataFrame.Column> = [],
        id?: string,
        presentationState: DataPresentationState = new DataPresentationState(),
        converter: DataConverter = new DataConverter()
    ) {
        let rowCount: number = 0;

        columnNames = columnNames.slice();
        columns = columns.map(
            (column: DataFrame.Column): DataFrame.Column => {
                rowCount = Math.max(rowCount, column.length);
                return column.slice();
            }
        );

        this.columns = columns;
        this.columnNames = columnNames;
        this.converter = converter;
        this.id = id || uniqueKey();
        this.presentationState = presentationState;
        this.rowCount = rowCount;

        if (columnNames.length < columns.length) {
            for (let i = 0, iEnd = columns.length; i < iEnd; ++i) {
                columnNames[i] = i.toString();
            }
        } else if (
            columnNames.length > columns.length
        ) {
            for (let i = 0, iEnd = columnNames.length; i < iEnd; ++i) {
                columns[i] = [];
            }
        }

        const idIndex = columnNames.indexOf('id');

        if (idIndex > -1) {
            columnNames.splice(idIndex, 1);
            this.rowIds = columns
                .splice(idIndex, 1)[0]
                .map((value: DataFrame.CellType): string => `${value}`);
        } else {
            this.rowIds = [];
        }
    }

    /* *
     *
     *  Properties
     *
     * */

    /**
     * A map of aliases for column names
     * [Alias]: columnName
     */
    public readonly aliasMap: Record<string, string> = {};

    /**
     * Converter for value conversions in table rows.
     */
    public readonly converter: DataConverter;

    private columnNames: Array<string>;

    private columns: Array<DataFrame.Column>;

    public id: string;

    public readonly presentationState: DataPresentationState;

    private rowCount: number;

    private rowIds: Array<string>;

    /**
     * Internal version tag that changes with each modification of the table or
     * a related row.
     */
    private versionTag?: string;

    /* *
     *
     *  Functions
     *
     * */

    /**
     * Removes all rows from this frame.
     *
     * @param {DataEventEmitter.EventDetail} [eventDetail]
     * Custom information for pending events.
     *
     * @emits DataTable#clearFrame
     * @emits DataTable#afterClearTable
     */
    public clear(eventDetail?: DataEventEmitter.EventDetail): void {

        this.emit({ type: 'clearFrame', detail: eventDetail });

        this.columns.length = 0;
        this.columnNames.length = 0;
        this.rowIds.length = 0;

        this.emit({ type: 'afterClearFrame', detail: eventDetail });
    }

    public clone(includeData?: boolean): DataFrame {
        const frame = this,
            newFrame = new DataFrame(
                frame.columnNames,
                (includeData ? frame.columns : []),
                frame.id,
                frame.presentationState,
                frame.converter
            ),
            aliasMapNames = Object.keys(frame.aliasMap);

        newFrame.rowIds = frame.rowIds.slice();
        newFrame.versionTag = frame.versionTag;

        for (
            let k = 0,
                kEnd = aliasMapNames.length,
                alias: string;
            k < kEnd;
            ++k
        ) {
            alias = aliasMapNames[k];
            newFrame.aliasMap[alias] = frame.aliasMap[alias];
        }

        if (frame.hcEvents) {
            const eventNames = Object.keys(frame.hcEvents);

            let eventName: DataFrame.EventObject['type'],
                eventArr,
                eventFunction;

            for (let i = 0, iEnd = eventNames.length; i < iEnd; i++) {
                eventName = eventNames[i] as DataFrame.EventObject['type'];
                eventArr = frame.hcEvents[eventName];

                for (let j = 0, jEnd = eventArr.length; j < jEnd; j++) {
                    eventFunction = (eventArr[j] as any).fn;
                    newFrame.on(eventName, eventFunction);
                }
            }
        }

        return newFrame;
    }

    /**
     * Deletes a column of cells from the table.
     *
     * @param {string} columnName
     * Name (no alias) of column that shall be deleted.
     *
     * @return {boolean}
     * `true` if at least one cell is deleted.
     */
    public deleteColumn(
        columnName: string
    ): boolean {
        const frame = this,
            columnNames = frame.columnNames,
            columnIndex = columnNames.indexOf(columnName),
            columns = frame.columns;

        if (columnIndex > 0) {
            columnNames.splice(columnIndex, 1);
            columns.splice(columnIndex, 1);
            return true;
        }

        return false;
    }

    /**
     * Deletes a column alias for this table.
     *
     * @param {string} alias
     * The alias to delete.
     */
    public deleteColumnAlias(alias: string): void {
        delete this.aliasMap[alias];
    }

    /**
     * Deletes a row in this table.
     *
     * @param {string|DataTableRow} row
     * Row or row ID to delete.
     *
     * @param {DataEventEmitter.EventDetail} [eventDetail]
     * Custom information for pending events.
     *
     * @return {boolean}
     * Returns true, if the delete was successful, otherwise false.
     *
     * @emits DataTable#deleteRow
     * @emits DataTable#afterDeleteRow
     */
    public deleteRow(
        row: (number|string),
        eventDetail?: DataEventEmitter.EventDetail
    ): (DataFrame.Row|undefined) {
        const frame = this,
            columns = frame.columns,
            deletedRow: DataFrame.Row = [];

        if (typeof row === 'string') {
            row = frame.rowIds.indexOf(row);
        }

        if (row < 0) {
            return;
        }

        this.emit({
            type: 'deleteRow',
            detail: eventDetail,
            rowIndex: row
        });

        for (let i = 0, iEnd = columns.length; i < iEnd; ++i) {
            deletedRow.push(...columns[i].splice(row, 1));
        }

        this.emit({
            type: 'afterDeleteRow',
            detail: eventDetail,
            rowIndex: row
        });

        return deletedRow;
    }

    /**
     * Emits an event on this table to all registered callbacks of the given
     * event.
     *
     * @param {DataFrame.EventObject} e
     * Event object with event information.
     */
    public emit(e: DataFrame.EventObject): void {
        fireEvent(this, e.type, e);
    }

    /**
     * Returns an array of all columns.
     *
     * @param {boolean} [usePresentationOrder]
     * Whether to use the column order of the presentation state.
     *
     * @return {Array<DataFrame.Column>}
     * Array of all columns.
     */
    public getAllColumns(
        usePresentationOrder?: boolean
    ): Array<DataFrame.Column> {
        const frame = this;

        if (usePresentationOrder) {
            const sortedColumnNames = frame.getColumnNames(usePresentationOrder),
                sortedColumns = [],
                unsortedColumnNames = frame.columnNames,
                unsortedColumns = frame.columns;

            for (let i = 0, iEnd = sortedColumnNames.length; i < iEnd; ++i) {
                sortedColumns.push(unsortedColumns[
                    unsortedColumnNames.indexOf(sortedColumnNames[i])
                ].slice());
            }

            return sortedColumns;
        }

        return frame.columns.map((column): DataFrame.Column => column.slice());
    }

    /**
     * Returns an array of all rows.
     *
     * @param {boolean} [usePresentationOrder]
     * Whether to use the column order of the presentation state.
     *
     * @return {Array<Array<DataFrame.CellType>>}
     * Array of all rows.
     */
    public getAllRows(
        usePresentationOrder?: boolean
    ): Array<Array<DataFrame.CellType>> {
        const frame = this,
            columns = frame.getAllColumns(usePresentationOrder),
            rows: Array<Array<DataFrame.CellType>> = [];

        if (columns.length) {
            for (
                let i = 0,
                    iEnd = columns[0].length,
                    row: Array<DataFrame.CellType>;
                i < iEnd;
                ++i
            ) {
                row = [];
                for (let j = 0, jEnd = columns.length; j < jEnd; ++j) {
                    row.push(columns[j][i]);
                }
                rows.push(row);
            }
        }

        return rows;
    }

    /**
     * Retrieves the given column, either by the canonical column name, or by an
     * alias.
     *
     * @param {string} columnNameOrAlias
     * Name or alias of the column to get, alias takes precedence.
     *
     * @return {DataTable.Column|undefined}
     * An array with column values, or `undefined` if not found.
     */
    public getColumn(columnNameOrAlias: string): (DataFrame.Column|undefined) {
        return this.getColumns([columnNameOrAlias])[0];
    }

    /**
     * Retrieves the column names.
     *
     * @param {boolean} [usePresentationOrder]
     * Whether to use the column order of the presentation state.
     *
     * @return {Array<string>}
     * Column names.
     */
    public getColumnNames(usePresentationOrder?: boolean): Array<string> {
        const frame = this,
            columnNames = frame.columnNames.slice();

        if (usePresentationOrder) {
            columnNames.sort(frame.presentationState.getColumnSorter());
        }
        return columnNames;
    }

    /**
     * Retrieves the given columns, either by the canonical column name,
     * or by an alias. This function can also retrieve row IDs as column `id`.
     *
     * @param {Array<string>} [columnNamesOrAlias]
     * Names or aliases for the columns to get, aliases taking precedence.
     *
     * @param {boolean} [usePresentationOrder]
     * Whether to use the column order of the presentation state.
     *
     * @return {Array<DataFrame.Column>}
     * A two-dimensional array of the specified columns,
     * if the column does not exist it will be `undefined`
     */
    public getColumns(
        columnNamesOrAlias: Array<string> = this.getColumnNames(),
        usePresentationOrder?: boolean
    ): Array<DataFrame.Column> {
        const frame = this,
            aliasMap = frame.aliasMap,
            columnNames = frame.columnNames,
            columns = frame.columns,
            fetchedColumns: Array<DataFrame.Column> = [];

        if (usePresentationOrder) {
            columnNamesOrAlias.sort(frame.presentationState.getColumnSorter());
        }

        for (
            let i = 0,
                iEnd = columnNamesOrAlias.length,
                columnIndex: number,
                columnNameOrAlias: string;
            i < iEnd;
            ++i
        ) {
            columnIndex = columnNames.indexOf(
                frame.getRealColumnName(columnNamesOrAlias[i])
            );

            if (columnIndex >= 0) {
                fetchedColumns[columnIndex] = columns[columnIndex].slice();
            }
        }

        return fetchedColumns;
    }

    /**
     * Returns the row with the given index or row ID.
     *
     * @param {number|string} row
     * Row index or row ID.
     *
     * @param {boolean} [usePresentationOrder]
     * Whether to use the column order of the presentation state.
     *
     * @return {Array<DataFrame.CellType>}
     * Column values of this row.
     */
    public getRow(
        row: (number|string),
        usePresentationOrder?: boolean
    ): (Array<DataFrame.CellType>|undefined) {
        const frame = this,
            columns = frame.getColumns(void 0, usePresentationOrder),
            fetchedRow = [];

        if (typeof row === 'string') {
            row = (frame.getRowIndex(row) || NaN);
        }

        for (let i = 0, iEnd = columns.length; i < iEnd; ++i) {
            fetchedRow.push(columns[i][row]);
        }

        return fetchedRow;
    }

    /**
     * Returns the column value for the given row.
     *
     * @param {number|string} row
     * Row ID or or index to fetch.
     *
     * @param {string} columnNameOrAlias
     * Column name or alias to fetch.
     *
     * @return {DataFrame.CellType}
     * Cell value for the row.
     */
    public getRowCell(
        row: (number|string),
        columnNameOrAlias: string
    ): DataFrame.CellType {
        const frame = this,
            frameColumn = (frame.getColumn(columnNameOrAlias) || []);

        if (typeof row === 'string') {
            row = (frame.getRowIndex(row) || NaN);
        }

        return frameColumn[row];
    }

    /**
     * Returns the number of rows in this table.
     *
     * @return {number}
     * Number of rows in this table.
     *
     * @todo Consider implementation via property getter `.length` depending on
     *       browser support.
     */
    public getRowCount(): number {
        return this.rowCount;
    }

    /**
     * Returns the ID of a given row index.
     *
     * @param {string} rowIndex
     * Row index to determ ID for.
     *
     * @return {number|undefined}
     * ID of the row in this frame, undefined if row index does not exist.
     */
    public getRowId(rowIndex: number): (string|undefined) {
        const frame = this;

        if (rowIndex >= frame.rowCount) {
            let rowId = frame.rowIds[rowIndex];

            if (!rowId) {
                frame.rowIds[rowIndex] = rowId = uniqueKey();
            }

            return rowId;
        }
    }

    /**
     * Returns the index of a given row in this table.
     *
     * @param {string} rowId
     * Row to determ index for.
     *
     * @return {number|undefined}
     * Index of the row in this table, undefined if not found.
     */
    public getRowIndex(rowId: string): (number|undefined) {
        const rowIndex = this.rowIds.indexOf(rowId);

        if (rowIndex > -1) {
            return rowIndex;
        }
    }

    /**
     * Registers a callback for a specific event.
     *
     * @param {string} type
     * Event type as a string.
     *
     * @param {DataEventEmitter.EventCallback} callback
     * Function to register for an event callback.
     *
     * @return {Function}
     * Function to unregister callback from the event.
     */
    public on(
        type: DataFrame.EventObject['type'],
        callback: DataEventEmitter.EventCallback<this, DataFrame.EventObject>
    ): Function {
        return addEvent(this, type, callback);
    }

    /**
     * Maps the alias to a column name, if it exists.
     *
     * @param {string} columnNameOrAlias
     * Column name to check for alias mapping.
     *
     * @return {string}
     * Column name to use in columnNames array.
     */
    private getRealColumnName(columnNameOrAlias: string): string {
        return (this.aliasMap[columnNameOrAlias] || columnNameOrAlias);
    }

    /**
     * Sets cell values for a column. Will insert a new column
     *
     * @param {string} columnNameOrAlias
     * Column name or alias to set.
     *
     * @param {DataFrame.Column} columnValues
     * Values to set in the column.
     *
     * @return {boolean}
     * Returns `true` if successful, `false` if not.
     */
    public setColumn(
        columnNameOrAlias: string,
        columnValues: DataFrame.Column = []
    ): boolean {
        const frame = this,
            columnNames = frame.columnNames;

        columnNameOrAlias = frame.getRealColumnName(columnNameOrAlias);

        if (columnNameOrAlias === 'id') {
            return false;
        }

        let columnIndex = columnNames.indexOf(columnNameOrAlias);

        if (columnIndex < 0) {
            columnIndex = (columnNames.push(columnNameOrAlias) - 1);
        }

        frame.columns[columnIndex] = columnValues.slice();

        return true;
    }

    /**
     * Defines an alias for a column.
     *
     * @param {string} columnAlias
     * Column alias to create. Cannot be `id`.
     *
     * @param {string} columnName
     * Column name to create an alias for.
     *
     * @return {boolean}
     * True if successfully changed, false if reserved.
     */
    public setColumnAlias(columnAlias: string, columnName: string): boolean {
        const aliasMap = this.aliasMap;

        if (columnAlias === 'id') {
            return false;
        }

        aliasMap[columnAlias] = columnName;

        return true;
    }

    /**
     * Sets cell values based on the rowID/index and column names / alias
     * alias. Will insert a new row if the specified row does not exist.
     *
     * @param {string|number|undefined} row
     * Row ID or index. Do not set to generate a new id.
     *
     * @param {Array<DataFrame.CellType>|Record<string,DataFrame.CellType>} rowCells
     * Cells as a dictionary of names and values.
     *
     * @param {DataEventEmitter.EventDetail} [eventDetail]
     * Custom information for pending events.
     *
     * @return {boolean}
     * Returns `true` if successful, otherwise `false`.
     */
    public setRow(
        row: (string|number) = uniqueKey(),
        rowCells: (
            Array<DataFrame.CellType>|
            Record<string, DataFrame.CellType>
        ),
        eventDetail?: DataEventEmitter.EventDetail
    ): boolean {
        const frame = this,
            columnNames = frame.columnNames,
            columns = frame.columns;

        if (typeof row === 'string') {
            const rowIndex = frame.getRowIndex(row);

            if (typeof rowIndex === 'number') { // found row id
                row = rowIndex;
            } else { // add row id
                frame.rowIds[frame.rowCount++] = row;
                row = (frame.rowCount - 1);
            }
        } else if (
            row >= frame.rowCount
        ) {
            frame.rowCount = (row + 1);
        }

        if (rowCells instanceof Array) {
            for (let i = 1, iEnd = rowCells.length; i <= iEnd; ++i) {
                if (!columns[i]) {
                    columnNames.push(i.toString());
                    columns.push([]);
                }
                columns[i][row] = rowCells[i - 1];
            }
        } else {
            const rowCellNames = Object.keys(rowCells);
            for (
                let i = 0,
                    iEnd = rowCellNames.length,
                    columnIndex: number,
                    columnName: string;
                i < iEnd;
                ++i
            ) {
                columnName = frame.getRealColumnName(rowCellNames[i]);
                columnIndex = columnNames.indexOf(columnName);
                if (columnIndex < 0) {
                    columnIndex = (columnNames.push(columnName) - 1);
                    columns[columnIndex] = [];
                }
                columns[columnIndex][row] = rowCells[rowCellNames[i]];
            }
        }

        return true;
    }

    /**
     * Sets a cell value based on the row ID/index and column name/alias.
     * Will insert a new row if the specified row does not exist.
     *
     * @param {string|number|undefined} row
     * Row ID or index to set. `undefined` to add a new row.
     *
     * @param {string} columnNameOrAlias
     * Column name or alias to set.
     *
     * @param {DataFrame.CellType} cellValue
     * Cell value to set.
     *
     * @param {DataEventEmitter.EventDetail} [eventDetail]
     * Custom information for pending events.
     *
     * @return {boolean}
     * `true` if successful, `false` if not
     */
    public setRowCell(
        row: (number|string|undefined),
        columnNameOrAlias: string,
        cellValue: DataFrame.CellType,
        eventDetail?: DataEventEmitter.EventDetail
    ): boolean {
        return this.setRow(
            row,
            { [columnNameOrAlias]: cellValue },
            eventDetail
        );
    }

}

interface DataFrame extends DataEventEmitter<DataFrame.EventObject> {
    // nothing here yet
}

namespace DataFrame {

    /**
     * Possible value types for a column in a row.
     *
     * *Please note:* `Date` and `DataTable` are not JSON-compatible and have
     * to be converted with the help of their `toJSON()` function.
     */
    export type CellType = (
        boolean|null|number|string|undefined
    );

    /**
     * All information objects of DataTable events.
     */
    export type EventObject = (RowEventObject|TableEventObject|ColumnEventObject);

    /**
     * Event types related to a row in a table.
     */
    export type RowEventType = (
        'deleteRow'|'afterDeleteRow'|
        'insertRow'|'afterInsertRow'|
        'afterUpdateRow'
    );

    /**
    * Event types related to a column in the table.
    */
    export type ColumnEventType = (
        'removeColumn'|'afterRemoveColumn'
    );

    /**
     * Event types related to the table itself.
     */
    export type TableEventType = (
        'clearFrame'|'afterClearFrame'
    );

    /**
     * Describes the class JSON of a DataTable.
     */
    export interface ClassJSON extends DataJSON.ClassJSON {
        presentationState?: DataPresentationState.ClassJSON;
        columnNames: Array<string>;
        columns: Array<Column>;
    }

    /**
     * An array of column values.
     */
    export interface Column extends Array<DataFrame.CellType> {
        [index: number]: DataFrame.CellType;
    }

    /**
     * A record of columns, where the key is the column name
     * and the value is an array of column values
     */
    export interface ColumnCollection {
        [columnNameOrAlias: string]: Column;
    }

    /**
     * Describes the information object for column-related events.
     */
    export interface ColumnEventObject extends DataEventEmitter.EventObject {
        readonly type: ColumnEventType;
        readonly columnName: string;
        readonly values?: Array<DataFrame.CellType>;
    }

    /**
     * An array of row values.
     */
    export interface Row extends Array<DataFrame.CellType> {
        [index: number]: DataFrame.CellType;
    }

    /**
     * Describes the information object for row-related events.
     */
    export interface RowEventObject extends DataEventEmitter.EventObject {
        readonly type: RowEventType;
        readonly rowIndex: number;
    }

    /**
     * Describes the information object for table-related events.
     */
    export interface TableEventObject extends DataEventEmitter.EventObject {
        readonly type: TableEventType;
    }

}

export default DataFrame;
