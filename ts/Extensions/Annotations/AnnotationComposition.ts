/* *
 *
 *  (c) 2009-2021 Highsoft, Black Label
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

import type Annotation from './Annotation';
import type { AnnotationOptions } from './AnnotationOptions';
import type { AnnotationTypeRegistry } from './Types/AnnotationType';
import type AST from '../../Core/Renderer/HTML/AST';
import type CoreChart from '../../Core/Chart/Chart';
import type GlobalOptions from '../../Core/Options';
import type NavigationBindings from './NavigationBindings';
import type Pointer from '../../Core/Pointer/Pointer';
import type CorePoint from '../../Core/Series/Point';
import type CoreSeries from '../../Core/Series/Series';
import type SVGElement from '../../Core/Renderer/SVG/SVGElement';

import U from '../../Core/Utilities.js';
const {
    addEvent,
    erase,
    extend,
    find,
    fireEvent,
    pick,
    wrap
} = U;

/* *
 *
 *  Declarations
 *
 * */

declare module '../../Core/Chart/ChartLike' {
    interface ChartLike {
        /** @requires Extensions/Annotations/AnnotationChart */
        annotations?: Array<Annotation>;
        /** @requires Extensions/Annotations/AnnotationChart */
        controlPointsGroup?: SVGElement;
        /** @requires Extensions/Annotations/AnnotationChart */
        plotBoxClip: SVGElement;
    }
}

/* eslint-disable no-invalid-this, valid-jsdoc */

/* *
 *
 *  Composition
 *
 * */

namespace AnnotationComposition {

    /* *
     *
     *  Declarations
     *
     * */

    export declare class Chart extends CoreChart implements ChartAdditions {
        annotations: Array<Annotation>;
        controlPointsGroup: SVGElement;
        navigationBindings: NavigationBindings;
        options: Options;
        plotBoxClip: SVGElement;
        series: Array<Series>;
        addAnnotation: ChartAdditions['addAnnotation'];
        drawAnnotations: ChartAdditions['drawAnnotations'];
        initAnnotation: ChartAdditions['initAnnotation'];
        removeAnnotation: ChartAdditions['removeAnnotation'];
    }

    export interface Options extends GlobalOptions {
        annotations: Array<AnnotationOptions>;
        defs: Record<string, AST.Node>;
        navigation: Highcharts.NavigationOptions;
    }


    export interface Point extends CorePoint {
        series: Series;
    }

    export interface Series extends CoreSeries {
        chart: AnnotationComposition.Chart;
        points: Array<Point>;
    }

    /* *
     *
     *  Constants
     *
     * */

    const composedClasses: Array<(typeof CoreChart|typeof Pointer)> = [];

    /* *
     *
     *  Variables
     *
     * */

    let annotationClass: typeof Annotation;

    let types: AnnotationTypeRegistry;

    /* *
     *
     *  Functions
     *
     * */

    /**
     * @private
     */
    function chartCallback(
        this: CoreChart
    ): void {
        const chart = this as Chart;

        chart.plotBoxClip = chart.renderer.clipRect(chart.plotBox);

        chart.controlPointsGroup = chart.renderer
            .g('control-points')
            .attr({ zIndex: 99 })
            .clip(chart.plotBoxClip)
            .add();

        chart.options.annotations.forEach(function (annotationOptions, i): void {
            if (
                // Verify, that it has not been previously added in a responsiv
                // rule
                !chart.annotations.some((annotation): boolean =>
                    annotation.options === annotationOptions
                )
            ) {
                const annotation = chart.initAnnotation(annotationOptions);

                chart.options.annotations[i] = annotation.options;
            }
        });

        chart.drawAnnotations();
        addEvent(chart, 'redraw', chart.drawAnnotations);
        addEvent(chart, 'destroy', function (): void {
            chart.plotBoxClip.destroy();
            chart.controlPointsGroup.destroy();
        });
        addEvent(chart, 'exportData', function (this, event: any): void {
            const annotations = chart.annotations,
                csvColumnHeaderFormatter = ((
                    this.options.exporting &&
                    this.options.exporting.csv) ||
                    {}).columnHeaderFormatter,
                // If second row doesn't have xValues
                // then it is a title row thus multiple level header is in use.
                multiLevelHeaders = !event.dataRows[1].xValues,
                annotationHeader = (
                    chart.options.lang &&
                    chart.options.lang.exportData &&
                    chart.options.lang.exportData.annotationHeader
                ),
                columnHeaderFormatter = function (index: any): any {
                    let s;
                    if (csvColumnHeaderFormatter) {
                        s = csvColumnHeaderFormatter(index);
                        if (s !== false) {
                            return s;
                        }
                    }

                    s = annotationHeader + ' ' + index;

                    if (multiLevelHeaders) {
                        return {
                            columnTitle: s,
                            topLevelColumnTitle: s
                        };
                    }

                    return s;
                },
                startRowLength = event.dataRows[0].length,
                annotationSeparator = (
                    chart.options.exporting &&
                    chart.options.exporting.csv &&
                    chart.options.exporting.csv.annotations &&
                    chart.options.exporting.csv.annotations.itemDelimiter
                ),
                joinAnnotations = (
                    chart.options.exporting &&
                    chart.options.exporting.csv &&
                    chart.options.exporting.csv.annotations &&
                    chart.options.exporting.csv.annotations.join
                );

            annotations.forEach((annotation): void => {

                if (annotation.options.labelOptions.includeInDataExport) {

                    annotation.labels.forEach((label): void => {
                        if (label.options.text) {
                            const annotationText = label.options.text;

                            label.points.forEach((points): void => {
                                const annotationX = points.x,
                                    xAxisIndex = points.series.xAxis ?
                                        points.series.xAxis.options.index :
                                        -1;
                                let wasAdded = false;

                                // Annotation not connected to any xAxis -
                                // add new row.
                                if (xAxisIndex === -1) {
                                    const n = event.dataRows[0].length,
                                        newRow: any = new Array(n);

                                    for (let i = 0; i < n; ++i) {
                                        newRow[i] = '';
                                    }
                                    newRow.push(annotationText);
                                    newRow.xValues = [];
                                    newRow.xValues[xAxisIndex] = annotationX;
                                    event.dataRows.push(newRow);
                                    wasAdded = true;
                                }

                                // Annotation placed on a exported data point
                                // - add new column
                                if (!wasAdded) {
                                    event.dataRows.forEach((row: any, rowIndex: number): void => {
                                        if (
                                            !wasAdded &&
                                            row.xValues &&
                                            xAxisIndex !== void 0 &&
                                            annotationX === row.xValues[xAxisIndex]
                                        ) {
                                            if (
                                                joinAnnotations &&
                                                row.length > startRowLength
                                            ) {
                                                row[row.length - 1] +=
                                                annotationSeparator + annotationText;
                                            } else {
                                                row.push(annotationText);
                                            }
                                            wasAdded = true;
                                        }
                                    });
                                }

                                // Annotation not placed on any exported data
                                // point, but connected to the xAxis - add new
                                // row
                                if (!wasAdded) {
                                    const n = event.dataRows[0].length,
                                        newRow: any = new Array(n);

                                    for (let i = 0; i < n; ++i) {
                                        newRow[i] = '';
                                    }
                                    newRow[0] = annotationX;
                                    newRow.push(annotationText);
                                    newRow.xValues = [];

                                    if (xAxisIndex !== void 0) {
                                        newRow.xValues[xAxisIndex] = annotationX;
                                    }
                                    event.dataRows.push(newRow);
                                }
                            });
                        }
                    });
                }
            });

            let maxRowLen = 0;

            event.dataRows.forEach((row: any): void => {
                maxRowLen = Math.max(maxRowLen, row.length);
            });

            const newRows = maxRowLen - event.dataRows[0].length;

            for (let i = 0; i < newRows; i++) {
                const header = columnHeaderFormatter(i + 1);

                if (multiLevelHeaders) {
                    event.dataRows[0].push(header.topLevelColumnTitle);
                    event.dataRows[1].push(header.columnTitle);
                } else {
                    event.dataRows[0].push(header);
                }
            }
        });
    }

    /**
     * @private
     */
    export function compose<T extends typeof CoreChart>(
        AnnotationClass: typeof Annotation,
        ChartClass: T,
        PointerClass: typeof Pointer
    ): (T&typeof Chart) {

        if (!annotationClass) {
            annotationClass = AnnotationClass;
            types = AnnotationClass.types;
        }

        if (composedClasses.indexOf(ChartClass) === -1) {
            composedClasses.push(ChartClass);

            const chartProto = ChartClass.prototype as Chart;

            chartProto.callbacks.push(chartCallback);
            // Let chart.update() update annotations
            chartProto.collectionsWithUpdate.push('annotations');
            // Let chart.update() create annoations on demand
            chartProto.collectionsWithInit.annotations = [
                ChartAdditions.prototype.addAnnotation
            ];

            extend(chartProto, ChartAdditions.prototype);
            addEvent(ChartClass, 'afterInit', onChartAfterInit);
        }

        if (composedClasses.indexOf(PointerClass) === -1) {
            composedClasses.push(PointerClass);

            wrap(PointerClass, 'onContainerMouseDown', wrapPointerOnContainerMouseDown);
        }

        return ChartClass as (T&typeof Chart);
    }

    /**
     * Create lookups initially
     */
    function onChartAfterInit(
        this: CoreChart
    ): void {
        const chart = this as Chart;

        chart.annotations = [];

        if (!chart.options.annotations) {
            chart.options.annotations = [];
        }
    }

    /**
     * @private
     */
    function wrapPointerOnContainerMouseDown(
        this: Pointer,
        proceed: Function
    ): void {
        const pointer = this;
        if (!pointer.chart.hasDraggedAnnotation) {
            proceed.apply(pointer, Array.prototype.slice.call(arguments, 1));
        }
    }

    /* *
     *
     *  Classes
     *
     * */

    class ChartAdditions {

        /* *
        *
        *  Functions
        *
        * */

        /**
         * Add an annotation to the chart after render time.
         *
         * @function Highcharts.Chart#addAnnotation
         *
         * @param  {Highcharts.AnnotationsOptions} options
         * The annotation options for the new, detailed annotation.
         *
         * @param {boolean} [redraw=true]
         * Whether to redraw or not.
         *
         * @return {Highcharts.Annotation}
         * The newly generated annotation.
         */
        public addAnnotation(
            this: Chart,
            userOptions: AnnotationOptions,
            redraw?: boolean
        ): Annotation {
            const chart = this,
                annotation = chart.initAnnotation(userOptions);

            chart.options.annotations.push(annotation.options);

            if (pick(redraw, true)) {
                annotation.redraw();
                annotation.graphic.attr({
                    opacity: 1
                });
            }
            return annotation;
        }

        public drawAnnotations(
            this: Chart
        ): void {
            const chart = this;

            chart.plotBoxClip.attr(chart.plotBox);

            chart.annotations.forEach(function (annotation): void {
                annotation.redraw();
                annotation.graphic.animate({
                    opacity: 1
                }, annotation.animationConfig);
            });
        }

        public initAnnotation(
            this: Chart,
            userOptions: AnnotationOptions
        ): Annotation {
            const chart = this,
                Constructor = (types[userOptions.type || ''] || annotationClass),
                annotation = new Constructor(chart, userOptions);

            chart.annotations.push(annotation);

            return annotation;
        }

        /**
         * Remove an annotation from the chart.
         *
         * @param {number|string|Highcharts.Annotation} idOrAnnotation
         * The annotation's id or direct annotation object.
         */
        public removeAnnotation(
            this: Chart,
            idOrAnnotation: (number|string|Annotation)
        ): void {
            const chart = this,
                annotations = chart.annotations,
                annotation: Annotation = (idOrAnnotation as any).coll === 'annotations' ?
                    idOrAnnotation :
                    find(
                        annotations,
                        function (annotation: Annotation): boolean {
                            return annotation.options.id === idOrAnnotation;
                        }
                    ) as any;

            if (annotation) {
                fireEvent(annotation, 'remove');
                erase(chart.options.annotations, annotation.options);
                erase(annotations, annotation);
                annotation.destroy();
            }
        }

    }

}

/* *
 *
 * Default Export
 *
 * */

export default AnnotationComposition;
