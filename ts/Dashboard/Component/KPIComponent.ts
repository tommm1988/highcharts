import type CSSObject from '../../Core/Renderer/CSSObject';
import Component from './Component.js';
import ChartComponent from './ChartComponent.js';
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
                textAlign: 'center'
            },
            thresholdColors: ['#f45b5b', '#90ed7d']
        }
    );

    public static defaultChartOptions: Highcharts.Options = {
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

    public options: KPIComponent.ComponentOptions;

    private value: HTMLElement;
    private title: HTMLElement;
    private chart?: ChartComponent;

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
        this.value = createElement('div', {
            className: `${Component.defaultOptions.className}-kpi-value`
        });
    }

    public load(): this {
        super.load();

        this.updateElements();

        this.element.appendChild(this.title);
        this.element.appendChild(this.value);
        this.parentElement.appendChild(this.element);

        this.element.style.width = this.dimensions.width + 'px';
        this.element.style.height = this.dimensions.height + 'px';

        this.updateSize(this.dimensions.width, this.dimensions.height);

        return this;
    }

    public resize(width: number, height: number): this {
        super.resize(width, height);

        this.updateSize(width, height);

        if (this.chart) {
            this.chart.resize(width, this.getChartHeight());
        }

        return this;
    }

    private updateSize(width: number, height: number): void {
        this.title.style.fontSize = 0.1 * Math.min(width, height) + 'px';
        this.value.style.height = this.chart ? '' : height * 0.65 + 'px';
        this.value.style.lineHeight = this.chart ? '' : height * 0.65 + 'px';
        this.value.style.fontSize = 0.2 * Math.min(width, height) + 'px';
    }

    private getChartHeight(): number {
        if (defined(this.options.value)) {
            return this.dimensions.height / 2;
        }
        return this.dimensions.height * 0.75;
    }

    public render(): this {
        super.render();

        if (this.options.chart && !this.chart) {
            this.chart = new ChartComponent({
                parentElement: this.element,
                chartOptions: merge(
                    KPIComponent.defaultChartOptions,
                    this.options.chart
                ),
                dimensions: {
                    width: this.dimensions.width,
                    height: this.getChartHeight()
                }
            }).render();

            this.chart.chartContainer.style.margin = '0px';
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
            this.chart.update({
                chartOptions: options.chart
            });
        }

        this.redraw();
        return this;
    }

    private updateElements(): void {
        const {
            style,
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
        }

        if (style) {
            css(this.element, style);
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
