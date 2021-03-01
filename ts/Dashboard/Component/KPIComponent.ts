import type CSSObject from '../../Core/Renderer/CSSObject';
import Chart from '../../Core/Chart/Chart.js';
import Component from './Component.js';
import H from '../../Core/Globals.js';
import U from '../../Core/Utilities.js';
const {
    createElement,
    css,
    defined,
    format,
    isArray,
    isNumber,
    merge
} = U;
import AST from '../../Core/Renderer/HTML/AST.js';

class KPIComponent extends Component {
    public static defaultOptions: KPIComponent.ComponentOptions = merge(
        Component.defaultOptions,
        {
            className: [
                Component.defaultOptions.className,
                `${Component.defaultOptions.className}-kpi`
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
        }
    );

    public static defaultChartOptions: Highcharts.Options = {
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

    public options: KPIComponent.ComponentOptions;

    public title: HTMLElement;
    public valueWrap: HTMLElement;
    public value: HTMLElement;
    public subtitle: HTMLElement;
    public chartContainer: HTMLElement;
    public chart?: Chart;

    constructor(options: Partial<KPIComponent.ComponentOptions>) {
        options = merge(
            KPIComponent.defaultOptions,
            options
        );
        super(options);

        this.options = options as KPIComponent.ComponentOptions;

        this.type = 'KPI';

        this.title = createElement('div', {
            className: `${Component.defaultOptions.className}-kpi-title`
        });
        this.valueWrap = createElement('div', {
            className: `${Component.defaultOptions.className}-kpi-value-wrap`
        });
        this.value = createElement('div', {
            className: `${Component.defaultOptions.className}-kpi-value`
        });
        this.subtitle = createElement('div', {
            className: `${Component.defaultOptions.className}-kpi-subtitle`
        });
        this.chartContainer = createElement('figure', {
            className: `${Component.defaultOptions.className}-kpi-chart-container`
        });
    }

    public load(): this {
        super.load();

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
    }

    public resize(width: number, height: number): this {
        super.resize(width, height);

        this.updateSize(width, height);

        if (this.chart) {
            this.chart.reflow();
        }

        return this;
    }

    private updateSize(width: number, height: number): void {
        this.title.style.fontSize = 0.1 * Math.min(width, height) + 'px';
        this.value.style.fontSize = 0.2 * Math.min(width, height) + 'px';
        this.subtitle.style.fontSize = 0.08 * Math.min(width, height) + 'px';
    }

    public render(): this {
        super.render();

        if (this.options.chart && !this.chart) {
            this.chart = H.chart(this.chartContainer, merge(
                KPIComponent.defaultChartOptions,
                this.options.chart
            ));
        }

        return this;
    }

    public redraw(): this {
        super.redraw();
        this.updateElements();
        return this.render();
    }

    public update(options: Partial<KPIComponent.ComponentOptions>): this {
        super.update(options);

        if (options.chart && this.chart) {
            this.chart.update(options.chart);
        }

        this.redraw();
        return this;
    }

    private updateElements(): void {
        const {
            style,
            subtitle,
            title,
            valueFormat,
            valueFormatter
        } = this.options;

        let value = this.options.value;

        if (defined(title)) {
            AST.setElementHTML(this.title, title);
        }

        if (defined(value)) {
            if (valueFormatter) {
                value = valueFormatter.call(this, value);
            } else if (valueFormat) {
                value = format(valueFormat, { value });
            } else if (isNumber(value)) {
                value = value.toLocaleString();
            }

            AST.setElementHTML(this.value, value);

            this.valueWrap.style.flex = '1';
        } else {
            this.valueWrap.style.flex = '0';
        }

        if (defined(subtitle)) {
            AST.setElementHTML(this.subtitle, subtitle);
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

        const color = this.getValueColor();
        if (color) {
            this.value.style.color = color;
        }
    }

    private getValueColor(): (string|undefined) {
        const {
            threshold,
            thresholdColors,
            value
        } = this.options;

        if (thresholdColors && threshold && isNumber(value)) {
            if (isArray(threshold)) {
                for (let i = threshold.length - 1; i >= 0; i--) {
                    if (value >= threshold[i]) {
                        if (i + 1 < thresholdColors.length) {
                            return thresholdColors[i + 1];
                        }
                        return thresholdColors[thresholdColors.length - 1];
                    }
                }
            } else if (value >= threshold) {
                return thresholdColors[1];
            }
            return thresholdColors[0];
        }
    }
}

namespace KPIComponent {
    export type ComponentType = KPIComponent;

    export interface ComponentOptions extends Component.ComponentOptions {
        chart?: Highcharts.Options;
        style?: CSSObject;
        threshold?: number|Array<number>;
        thresholdColors?: Array<string>;
        title?: string;
        value?: number|string;
        subtitle?: string;
        valueFormat?: string;
        valueFormatter?: ValueFormatterCallbackFunction;
    }

    export interface ValueFormatterCallbackFunction {
        (
            this: KPIComponent,
            value: (number|string)
        ): string;
    }
}

export default KPIComponent;
