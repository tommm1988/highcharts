import DataConverter from './DataConverter.js';
import DataPresentationState from './DataPresentationState.js';
import U from '../Core/Utilities.js';
var addEvent = U.addEvent, fireEvent = U.fireEvent, merge = U.merge, uniqueKey = U.uniqueKey;
var DataFrame = /** @class */ (function () {
    /* *
     *
     *  Constructors
     *
     * */
    function DataFrame(columnNames, columns, id, presentationState, converter) {
        if (columnNames === void 0) { columnNames = []; }
        if (columns === void 0) { columns = []; }
        if (presentationState === void 0) { presentationState = new DataPresentationState(); }
        if (converter === void 0) { converter = new DataConverter(); }
        /* *
         *
         *  Properties
         *
         * */
        /**
         * A map of aliases for column names
         * [Alias]: columnName
         */
        this.aliasMap = {};
        var rowCount = 0;
        columnNames = columnNames.slice();
        columns = columns.map(function (column) {
            rowCount = Math.max(rowCount, column.length);
            return column.slice();
        });
        this.columns = columns;
        this.columnNames = columnNames;
        this.converter = converter;
        this.id = id || uniqueKey();
        this.presentationState = presentationState;
        this.rowCount = rowCount;
        if (columnNames.length < columns.length) {
            for (var i = 0, iEnd = columns.length; i < iEnd; ++i) {
                columnNames[i] = i.toString();
            }
        }
        else if (columnNames.length > columns.length) {
            for (var i = 0, iEnd = columnNames.length; i < iEnd; ++i) {
                columns[i] = [];
            }
        }
        var idIndex = columnNames.indexOf('id');
        if (idIndex > -1) {
            columnNames.splice(idIndex, 1);
            this.rowIds = columns
                .splice(idIndex, 1)[0]
                .map(function (value) { return "" + value; });
        }
        else {
            this.rowIds = [];
        }
    }
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
    DataFrame.prototype.clear = function (eventDetail) {
        this.emit({ type: 'clearFrame', detail: eventDetail });
        this.columns.length = 0;
        this.columnNames.length = 0;
        this.rowIds.length = 0;
        this.emit({ type: 'afterClearFrame', detail: eventDetail });
    };
    DataFrame.prototype.clone = function (includeData) {
        var frame = this, newFrame = new DataFrame(frame.columnNames, (includeData ? frame.columns : []), frame.id, frame.presentationState, frame.converter), aliasMapNames = Object.keys(frame.aliasMap);
        newFrame.rowIds = frame.rowIds.slice();
        newFrame.versionTag = frame.versionTag;
        for (var k = 0, kEnd = aliasMapNames.length, alias = void 0; k < kEnd; ++k) {
            alias = aliasMapNames[k];
            newFrame.aliasMap[alias] = frame.aliasMap[alias];
        }
        if (frame.hcEvents) {
            var eventNames = Object.keys(frame.hcEvents);
            var eventName = void 0, eventArr = void 0, eventFunction = void 0;
            for (var i = 0, iEnd = eventNames.length; i < iEnd; i++) {
                eventName = eventNames[i];
                eventArr = frame.hcEvents[eventName];
                for (var j = 0, jEnd = eventArr.length; j < jEnd; j++) {
                    eventFunction = eventArr[j].fn;
                    newFrame.on(eventName, eventFunction);
                }
            }
        }
        return newFrame;
    };
    /**
     * Deletes a column of cells from the table.
     *
     * @param {string} columnName
     * Name (no alias) of column that shall be deleted.
     *
     * @return {boolean}
     * `true` if at least one cell is deleted.
     */
    DataFrame.prototype.deleteColumn = function (columnName) {
        var frame = this, columnNames = frame.columnNames, columnIndex = columnNames.indexOf(columnName), columns = frame.columns;
        if (columnIndex > 0) {
            columnNames.splice(columnIndex, 1);
            columns.splice(columnIndex, 1);
            return true;
        }
        return false;
    };
    /**
     * Deletes a column alias for this table.
     *
     * @param {string} alias
     * The alias to delete.
     */
    DataFrame.prototype.deleteColumnAlias = function (alias) {
        delete this.aliasMap[alias];
    };
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
    DataFrame.prototype.deleteRow = function (row, eventDetail) {
        var frame = this, columns = frame.columns, deletedRow = [];
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
        for (var i = 0, iEnd = columns.length; i < iEnd; ++i) {
            deletedRow.push.apply(deletedRow, columns[i].splice(row, 1));
        }
        this.emit({
            type: 'afterDeleteRow',
            detail: eventDetail,
            rowIndex: row
        });
        return deletedRow;
    };
    /**
     * Emits an event on this table to all registered callbacks of the given
     * event.
     *
     * @param {DataFrame.EventObject} e
     * Event object with event information.
     */
    DataFrame.prototype.emit = function (e) {
        fireEvent(this, e.type, e);
    };
    /**
     * Returns an array of all columns.
     *
     * @param {boolean} [usePresentationOrder]
     * Whether to use the column order of the presentation state.
     *
     * @return {Array<DataFrame.Column>}
     * Array of all columns.
     */
    DataFrame.prototype.getAllColumns = function (usePresentationOrder) {
        var frame = this;
        if (usePresentationOrder) {
            var sortedColumnNames = frame.getColumnNames(usePresentationOrder), sortedColumns = [], unsortedColumnNames = frame.columnNames, unsortedColumns = frame.columns;
            for (var i = 0, iEnd = sortedColumnNames.length; i < iEnd; ++i) {
                sortedColumns.push(unsortedColumns[unsortedColumnNames.indexOf(sortedColumnNames[i])].slice());
            }
            return sortedColumns;
        }
        return frame.columns.map(function (column) { return column.slice(); });
    };
    /**
     * Returns an array of all rows.
     *
     * @param {boolean} [usePresentationOrder]
     * Whether to use the column order of the presentation state.
     *
     * @return {Array<Array<DataFrame.CellType>>}
     * Array of all rows.
     */
    DataFrame.prototype.getAllRows = function (usePresentationOrder) {
        var frame = this, columns = frame.getAllColumns(usePresentationOrder), rows = [];
        if (columns.length) {
            for (var i = 0, iEnd = columns[0].length, row = void 0; i < iEnd; ++i) {
                row = [];
                for (var j = 0, jEnd = columns.length; j < jEnd; ++j) {
                    row.push(columns[j][i]);
                }
                rows.push(row);
            }
        }
        return rows;
    };
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
    DataFrame.prototype.getColumn = function (columnNameOrAlias) {
        return this.getColumns([columnNameOrAlias])[0];
    };
    /**
     * Retrieves the column names.
     *
     * @param {boolean} [usePresentationOrder]
     * Whether to use the column order of the presentation state.
     *
     * @return {Array<string>}
     * Column names.
     */
    DataFrame.prototype.getColumnNames = function (usePresentationOrder) {
        var frame = this, columnNames = frame.columnNames.slice();
        if (usePresentationOrder) {
            columnNames.sort(frame.presentationState.getColumnSorter());
        }
        return columnNames;
    };
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
    DataFrame.prototype.getColumns = function (columnNamesOrAlias, usePresentationOrder) {
        if (columnNamesOrAlias === void 0) { columnNamesOrAlias = this.getColumnNames(); }
        var frame = this, aliasMap = frame.aliasMap, columnNames = frame.columnNames, columns = frame.columns, fetchedColumns = [];
        if (usePresentationOrder) {
            columnNamesOrAlias.sort(frame.presentationState.getColumnSorter());
        }
        for (var i = 0, iEnd = columnNamesOrAlias.length, columnIndex = void 0, columnNameOrAlias = void 0; i < iEnd; ++i) {
            columnIndex = columnNames.indexOf(frame.getRealColumnName(columnNamesOrAlias[i]));
            if (columnIndex >= 0) {
                fetchedColumns[columnIndex] = columns[columnIndex].slice();
            }
        }
        return fetchedColumns;
    };
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
    DataFrame.prototype.getRow = function (row, usePresentationOrder) {
        var frame = this, columns = frame.getColumns(void 0, usePresentationOrder), fetchedRow = [];
        if (typeof row === 'string') {
            row = (frame.getRowIndex(row) || NaN);
        }
        for (var i = 0, iEnd = columns.length; i < iEnd; ++i) {
            fetchedRow.push(columns[i][row]);
        }
        return fetchedRow;
    };
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
    DataFrame.prototype.getRowCell = function (row, columnNameOrAlias) {
        var frame = this, frameColumn = (frame.getColumn(columnNameOrAlias) || []);
        if (typeof row === 'string') {
            row = (frame.getRowIndex(row) || NaN);
        }
        return frameColumn[row];
    };
    /**
     * Returns the number of rows in this table.
     *
     * @return {number}
     * Number of rows in this table.
     *
     * @todo Consider implementation via property getter `.length` depending on
     *       browser support.
     */
    DataFrame.prototype.getRowCount = function () {
        return this.rowCount;
    };
    /**
     * Returns the ID of a given row index.
     *
     * @param {string} rowIndex
     * Row index to determ ID for.
     *
     * @return {number|undefined}
     * ID of the row in this frame, undefined if row index does not exist.
     */
    DataFrame.prototype.getRowId = function (rowIndex) {
        var frame = this;
        if (rowIndex >= frame.rowCount) {
            var rowId = frame.rowIds[rowIndex];
            if (!rowId) {
                frame.rowIds[rowIndex] = rowId = uniqueKey();
            }
            return rowId;
        }
    };
    /**
     * Returns the index of a given row in this table.
     *
     * @param {string} rowId
     * Row to determ index for.
     *
     * @return {number|undefined}
     * Index of the row in this table, undefined if not found.
     */
    DataFrame.prototype.getRowIndex = function (rowId) {
        var rowIndex = this.rowIds.indexOf(rowId);
        if (rowIndex > -1) {
            return rowIndex;
        }
    };
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
    DataFrame.prototype.on = function (type, callback) {
        return addEvent(this, type, callback);
    };
    /**
     * Maps the alias to a column name, if it exists.
     *
     * @param {string} columnNameOrAlias
     * Column name to check for alias mapping.
     *
     * @return {string}
     * Column name to use in columnNames array.
     */
    DataFrame.prototype.getRealColumnName = function (columnNameOrAlias) {
        return (this.aliasMap[columnNameOrAlias] || columnNameOrAlias);
    };
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
    DataFrame.prototype.setColumn = function (columnNameOrAlias, columnValues) {
        if (columnValues === void 0) { columnValues = []; }
        var frame = this, columnNames = frame.columnNames;
        columnNameOrAlias = frame.getRealColumnName(columnNameOrAlias);
        if (columnNameOrAlias === 'id') {
            return false;
        }
        var columnIndex = columnNames.indexOf(columnNameOrAlias);
        if (columnIndex < 0) {
            columnIndex = (columnNames.push(columnNameOrAlias) - 1);
        }
        frame.columns[columnIndex] = columnValues.slice();
        return true;
    };
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
    DataFrame.prototype.setColumnAlias = function (columnAlias, columnName) {
        var aliasMap = this.aliasMap;
        if (columnAlias === 'id') {
            return false;
        }
        aliasMap[columnAlias] = columnName;
        return true;
    };
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
    DataFrame.prototype.setRow = function (row, rowCells, eventDetail) {
        if (row === void 0) { row = uniqueKey(); }
        var frame = this, columnNames = frame.columnNames, columns = frame.columns;
        if (typeof row === 'string') {
            var rowIndex = frame.getRowIndex(row);
            if (typeof rowIndex === 'number') { // found row id
                row = rowIndex;
            }
            else { // add row id
                frame.rowIds[frame.rowCount++] = row;
                row = (frame.rowCount - 1);
            }
        }
        else if (row >= frame.rowCount) {
            frame.rowCount = (row + 1);
        }
        if (rowCells instanceof Array) {
            for (var i = 1, iEnd = rowCells.length; i <= iEnd; ++i) {
                if (!columns[i]) {
                    columnNames.push(i.toString());
                    columns.push([]);
                }
                columns[i][row] = rowCells[i - 1];
            }
        }
        else {
            var rowCellNames = Object.keys(rowCells);
            for (var i = 0, iEnd = rowCellNames.length, columnIndex = void 0, columnName = void 0; i < iEnd; ++i) {
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
    };
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
    DataFrame.prototype.setRowCell = function (row, columnNameOrAlias, cellValue, eventDetail) {
        var _a;
        return this.setRow(row, (_a = {}, _a[columnNameOrAlias] = cellValue, _a), eventDetail);
    };
    return DataFrame;
}());
export default DataFrame;
