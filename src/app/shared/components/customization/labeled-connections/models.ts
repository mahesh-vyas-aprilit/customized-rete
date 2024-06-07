import { ClassicPreset as Classic } from 'rete';
import type { ILabel, INode } from 'src/app/shared/types/rete-types';

export class Connection<
  A extends INode,
  B extends INode
> extends Classic.Connection<A, B> {
  label?: ILabel;
  labelColor?: string;
  labelIcon?: string;

  constructor(
    source: A,
    sourceOutput: keyof A['outputs'],
    target: B,
    targetInput: keyof B['outputs'],
    props?: {
      label?: ILabel;
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
