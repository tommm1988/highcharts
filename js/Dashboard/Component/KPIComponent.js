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
import H from '../../Core/Globals.js';
import U from '../../Core/Utilities.js';
var createElement = U.createElement, css = U.css, defined = U.defined, format = U.format, isArray = U.isArray, isNumber = U.isNumber, merge = U.merge;
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
        _this.valueWrap = createElement('div', {
            className: Component.defaultOptions.className + "-kpi-value-wrap"
        });
        _this.value = createElement('div', {
            className: Component.defaultOptions.className + "-kpi-value"
        });
        _this.subtitle = createElement('div', {
            className: Component.defaultOptions.className + "-kpi-subtitle"
        });
        _this.chartContainer = createElement('figure', {
            className: Component.defaultOptions.className + "-kpi-chart-container"
        });
        return _this;
    }
    KPIComponent.prototype.load = function () {
        _super.prototype.load.call(this);
        this.element.appendChild(this.title);
        this.element.appendChild(this.valueWrap);
        this.valueWrap.appendChild(this.value);
        this.valueWrap.appendChild(this.subtitle);
        this.element.appendChild(this.chartContainer);
        this.parentElement.appendChild(this.element);
        this.updateElements();
        this.element.style.width = this.dimensions.width + 'px';
        this.element.style.height = this.dimensions.height + 'px';
        this.updateSize(this.dimensions.width, this.dimensions.height);
        return this;
    };
    KPIComponent.prototype.resize = function (width, height) {
        _super.prototype.resize.call(this, width, height);
        this.updateSize(width, height);
        if (this.chart) {
            this.chart.reflow();
        }
        return this;
    };
    KPIComponent.prototype.updateSize = function (width, height) {
        this.title.style.fontSize = 0.1 * Math.min(width, height) + 'px';
        this.value.style.fontSize = 0.2 * Math.min(width, height) + 'px';
        this.subtitle.style.fontSize = 0.08 * Math.min(width, height) + 'px';
    };
    KPIComponent.prototype.render = function () {
        _super.prototype.render.call(this);
        if (this.options.chart && !this.chart) {
            this.chart = H.chart(this.chartContainer, merge(KPIComponent.defaultChartOptions, this.options.chart));
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
            this.chart.update(options.chart);
        }
        this.redraw();
        return this;
    };
    KPIComponent.prototype.updateElements = function () {
        var _a = this.options, style = _a.style, title = _a.title, valueFormat = _a.valueFormat, valueFormatter = _a.valueFormatter;
        var value = this.options.value;
        AST.setElementHTML(this.title, title || '');
        if (defined(value)) {
            var prevValue = void 0;
            if (isNumber(value)) {
                prevValue = value;
            }
            if (valueFormatter) {
                value = valueFormatter.call(this, value);
            }
            else if (valueFormat) {
                value = format(valueFormat, { value: value });
            }
            else if (isNumber(value)) {
                value = value.toLocaleString();
            }
            AST.setElementHTML(this.value, value);
            AST.setElementHTML(this.subtitle, this.getSubtitle());
            this.prevValue = prevValue;
            this.valueWrap.style.flex = '1';
        }
        else {
            this.valueWrap.style.flex = '0';
        }
        if (style) {
            css(this.element, style);
        }
        css(this.chartContainer, {
            flex: this.options.chart ? 1 : 0
        });
        if (this.chart) {
            this.chart.reflow();
        }
        this.value.style.color = this.getValueColor();
    };
    KPIComponent.prototype.getSubtitle = function () {
        var _a = this.options, subtitle = _a.subtitle, value = _a.value;
        if (typeof subtitle === 'string') {
            return subtitle;
        }
        if (subtitle) {
            if (isNumber(this.prevValue) && isNumber(value)) {
                var diff = value - this.prevValue;
                var prefix = '';
                if (diff > 0) {
                    prefix = '<span style="color:green">&#9650;</span> +';
                }
                else if (diff < 0) {
                    prefix = '<span style="color:red">&#9660;</span> ';
                }
                else {
                    return this.subtitle.innerHTML;
                }
                if (subtitle.type === 'diff') {
                    return prefix + diff.toLocaleString();
                }
                if (subtitle.type === 'diffpercent') {
                    return prefix + format('{v:,.2f}%', {
                        v: diff / this.prevValue * 100
                    });
                }
            }
            else {
                return subtitle.text || '';
            }
        }
        return '';
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
        return '';
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
            display: 'flex',
            flexDirection: 'column',
            textAlign: 'center'
        },
        thresholdColors: ['#f45b5b', '#90ed7d']
    });
    KPIComponent.defaultChartOptions = {
        chart: {
            type: 'spline',
            backgroundColor: 'transparent'
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
