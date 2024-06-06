import { ClassicPreset as Classic } from 'rete';
import { DataflowNode } from 'rete-engine';
import { IStep } from '../types';

const socket = new Classic.Socket('socket');

export class MyNode extends Classic.Node {
  width = 309;
  height = 82;
  stepData: IStep;

  constructor(stepData: IStep) {
    super(stepData.stepName);
    this.stepData = stepData;
    this.addInput('value', new Classic.Input(socket, undefined, true));
    this.addOutput('value', new Classic.Output(socket));
  }

  data() {
    return {
      value: 0,
    };
  }
}

export class StartingNode extends Classic.Node implements DataflowNode {
  width = 309;
  height = 82;
  stepData: IStep;

  constructor(stepData: IStep) {
    super(stepData.stepName);
    this.stepData = stepData;
    this.addOutput('value', new Classic.Output(socket));
  }
  data() {
    const value = (this.controls['value'] as Classic.InputControl<'text'>)
      .value;

    return {
      value,
    };
  }
}

export class EndNode extends Classic.Node implements DataflowNode {
  width = 103;
  height = 54;
  stepData: IStep;

  constructor(stepData: IStep) {
    super(stepData.stepName);
    this.stepData = stepData;
    this.addInput('value', new Classic.Input(socket));
  }

  data() {
    const value = (this.controls['value'] as Classic.InputControl<'text'>)
      .value;

    return {
      value,
    };
  }
}
