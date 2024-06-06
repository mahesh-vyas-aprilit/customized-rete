import { BaseSchemes } from 'rete';

export abstract class Strategy {
  abstract add(element: HTMLElement, create: () => BaseSchemes['Node']): void;
}

export abstract class StrategyV2 {
  abstract add(element: any, create: BaseSchemes['Node']): void;
}
