var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import Component from './Component.js';
import ChartComponent from './ChartComponent.js';
import U from '../../Core/Utilities.js';
var createElement = U.createElement, css = U.css, defined = U.defined, isArray = U.isArray, isNumber = U.isNumber, merge = U.merge;
import AST from '../../Core/Renderer/HTML/AST.js';
var KPIComponent = /** @class */ (function (_super) {
    __extends(KPIComponent, _super);
    function KPIComponent(options) {
        var _this = this;
        options = merge(KPIComponent.defaultOptions, options);
        _this = _super.call(this, options) || this;
        _this.options = options;
        _this.type = 'KPI';
        _this.title = createElement('div', {
            className: Component.defaultOptions.className + "-kpi-title"
        });
        _this.value = createElement('div', {
            className: Component.defaultOptions.className + "-kpi-value"
        });
        return _this;
    }
    KPIComponent.prototype.load = function () {
        _super.prototype.load.call(this);
        this.updateElements();
        this.element.appendChild(this.title);
        this.element.appendChild(this.value);
        this.parentElement.appendChild(this.element);
        this.element.style.width = this.dimensions.width + 'px';
        this.element.style.height = this.dimensions.height + 'px';
        this.updateSize(this.dimensions.width, this.dimensions.height);
        return this;
    };
    KPIComponent.prototype.resize = function (width, height) {
        _super.prototype.resize.call(this, width, height);
        this.updateSize(width, height);
        if (this.chart) {
            this.chart.resize(width, this.getChartHeight());
        }
        return this;
    };
    KPIComponent.prototype.updateSize = function (width, height) {
        this.title.style.fontSize = 0.1 * Math.min(width, height) + 'px';
        this.value.style.height = this.chart ? '' : height * 0.65 + 'px';
        this.value.style.lineHeight = this.chart ? '' : height * 0.65 + 'px';
        this.value.style.fontSize = 0.2 * Math.min(width, height) + 'px';
    };
    KPIComponent.prototype.getChartHeight = function () {
        if (defined(this.options.value)) {
            return this.dimensions.height / 2;
        }
        return this.dimensions.height * 0.75;
    };
    KPIComponent.prototype.render = function () {
        _super.prototype.render.call(this);
        if (this.options.chart && !this.chart) {
            this.chart = new ChartComponent({
                parentElement: this.element,
                chartOptions: merge(KPIComponent.defaultChartOptions, this.options.chart),
                dimensions: {
                    width: this.dimensions.width,
                    height: this.getChartHeight()
                }
            }).render();
            this.chart.chartContainer.style.margin = '0px';
        }
        return this;
    };
    KPIComponent.prototype.redraw = function () {
        _super.prototype.redraw.call(this);
        this.updateElements();
        return this.render();
    };
    KPIComponent.prototype.update = function (options) {
        _super.prototype.update.call(this, options);
        if (options.chart && this.chart) {
            this.chart.update({
                chartOptions: options.chart
            });
        }
        this.redraw();
        return this;
    };
    KPIComponent.prototype.updateElements = function () {
        var _a = this.options, style = _a.style, title = _a.title, value = _a.value;
        if (defined(title)) {
            AST.setElementHTML(this.title, title);
        }
        if (defined(value)) {
            AST.setElementHTML(this.value, typeof value === 'string' ? value : value.toLocaleString());
        }
        if (style) {
            css(this.element, style);
        }
        var color = this.getValueColor();
        if (color) {
            this.value.style.color = color;
        }
    };
    KPIComponent.prototype.getValueColor = function () {
        var _a = this.options, threshold = _a.threshold, thresholdColors = _a.thresholdColors, value = _a.value;
        if (thresholdColors && threshold && isNumber(value)) {
            if (isArray(threshold)) {
                for (var i = threshold.length - 1; i >= 0; i--) {
                    if (value >= threshold[i]) {
                        if (i + 1 < thresholdColors.length) {
                            return thresholdColors[i + 1];
                        }
                        return thresholdColors[thresholdColors.length - 1];
                    }
                }
            }
            else if (value >= threshold) {
                return thresholdColors[1];
            }
            return thresholdColors[0];
        }
    };
    KPIComponent.defaultOptions = merge(Component.defaultOptions, {
        className: [
            Component.defaultOptions.className,
            Component.defaultOptions.className + "-kpi"
        ].join(' '),
        dimensions: {
            width: 250,
            height: 150
        },
        style: {
            boxSizing: 'border-box',
            textAlign: 'center'
        },
        thresholdColors: ['#f45b5b', '#90ed7d']
    });
    KPIComponent.defaultChartOptions = {
        chart: {
            type: 'spline'
        },
        title: {
            text: void 0
        },
        xAxis: {
            visible: false
        },
        yAxis: {
            visible: false,
            title: {
                text: null
            }
        },
        legend: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        tooltip: {
            outside: true
        },
        plotOptions: {
            series: {
                marker: {
                    enabled: false
                }
            }
        }
    };
    return KPIComponent;
}(Component));
export default KPIComponent;
