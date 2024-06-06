import { ClassicPreset as Classic } from 'rete';
import { Node } from 'src/app/rete';
import { IActionTemplate } from 'src/app/types';

export type LabelPosition = 'start' | 'center' | 'end';
export type Label = { text: string; position?: LabelPosition };

export class Connection<
  A extends Node,
  B extends Node
> extends Classic.Connection<A, B> {
  label?: Label;
  labelColor?: string;
  labelIcon?: string;

  constructor(
    source: A,
    sourceOutput: keyof A['outputs'],
    target: B,
    targetInput: keyof B['outputs'],
    props?: {
      label?: Label;
      labelColor?: string;
      labelIcon?: string;
    }
  ) {
    super(source, sourceOutput, target, targetInput);
    this.label = props?.label;
    this.labelColor = props?.labelColor;
    this.labelIcon = props?.labelIcon;
  }
}
