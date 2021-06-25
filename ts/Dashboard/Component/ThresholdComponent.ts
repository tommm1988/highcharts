import Component from './Component.js';
import U from '../../Core/Utilities.js';
const {
    isNumber,
    merge,
    pick
} = U;

class ThresholdComponent extends Component {
    public static defaultOptions = merge(
        Component.defaultOptions,
        {
            valueName: 'value'
        }
    );

    public options: ThresholdComponent.ComponentOptions;
    public component?: Component;

    constructor(options: Partial<ThresholdComponent.ComponentOptions>) {
        options = merge(
            ThresholdComponent.defaultOptions,
            options
        );
        super(options);

        this.options = options as ThresholdComponent.ComponentOptions;

        this.type = 'threshold';
    }

    public render(): this {
        super.render();

        const { options } = this;
        const { valueName } = options;
        let componentOptions = options.options || {};

        const value = pick(
            options.value,
            (componentOptions as any)[valueName || '']
        );

        let CurrentComponent = options.component;

        if (options.thresholds && isNumber(value)) {
            let baseComponent = true;
            let start: number|undefined;
            let end = 0;

            const sortedThresholds = options.thresholds.slice().sort(
                (a, b): number =>
                    pick(a.min, a.max, Number.MIN_VALUE) -
                    pick(b.min, a.max, Number.MIN_VALUE)
            );

            for (let i = sortedThresholds.length - 1; i >= 0; i--) {
                const threshold = sortedThresholds[i];

                if (
                    value >= pick(threshold.min, Number.MIN_VALUE) &&
                    value <= pick(threshold.max, Number.MAX_VALUE)
                ) {
                    if (threshold.component) {
                        if (baseComponent) {
                            if (threshold.component !== CurrentComponent) {
                                baseComponent = false;
                                CurrentComponent = threshold.component;
                                start = i;
                            }
                        } else if (threshold.component === CurrentComponent) {
                            start = i;
                        }
                    }
                    if (!end) {
                        end = i + 1;
                    }
                }
            }

            if (end) {
                componentOptions = merge(
                    baseComponent ? componentOptions : {},
                    ...sortedThresholds
                        .slice(start, end)
                        .map((t): any => t.options)
                );
            }
        }

        componentOptions.parentElement = options.parentElement;

        // TODO: undoOptions
        /* if (this.component instanceof component) {
            this.component.update(componentOptions);
        } else {*/
        this.parentElement.innerHTML = '';
        this.component = new CurrentComponent(merge(
            valueName && isNumber(options.value) ?
                { [valueName]: options.value } :
                {},
            componentOptions
        )).render();
        // }

        return this;
    }

    public redraw(): this {
        super.redraw();
        return this.render();
    }

    public update(options: Partial<ThresholdComponent.ComponentOptions>): this {
        super.update(options);
        return this.redraw();
    }
}

namespace ThresholdComponent {
    export type ComponentType = ThresholdComponent;

    export type ComponentConstructor = new (...a: any[]) => Component;

    export interface ComponentOptions extends Component.ComponentOptions {
        component: ComponentConstructor;
        options?: any;
        thresholds?: Array<ThresholdOption>;
        value?: number;
        valueName?: string;
    }

    export interface ThresholdOption {
        component?: ComponentConstructor;
        max?: number;
        min?: number;
        options?: any;
    }
}

export default ThresholdComponent;
