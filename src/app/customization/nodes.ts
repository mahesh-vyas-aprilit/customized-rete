import { ClassicPreset as Classic } from 'rete';
import { DataflowNode } from 'rete-engine';
import { IStep } from '../types';

const socket = new Classic.Socket('socket');

export class NumberNode extends Classic.Node implements DataflowNode {
  width = 224;
  height = 104;

  constructor(initial: number, change?: (value: number) => void) {
    super('Number');

    this.addOutput('value', new Classic.Output(socket, 'Number'));
    this.addControl(
      'value',
      new Classic.InputControl('number', { initial, change })
    );
  }
  data() {
    const value = (this.controls['value'] as Classic.InputControl<'number'>)
      .value;

    return {
      value,
    };
  }
}

export class AddNode extends Classic.Node implements DataflowNode {
  width = 224;
  height = 102;

  constructor() {
    super('Add');

    this.addInput('a', new Classic.Input(socket, 'A'));
    this.addInput('b', new Classic.Input(socket, 'B'));
    this.addOutput('value', new Classic.Output(socket, 'Number'));
    this.addControl(
      'result',
      new Classic.InputControl('number', { initial: 0, readonly: true })
    );
  }
  data(inputs: { a?: number[]; b?: number[] }) {
    const { a = [], b = [] } = inputs;
    const sum = (a[0] || 0) + (b[0] || 0);

    (this.controls['result'] as Classic.InputControl<'number'>).setValue(sum);

    return {
      value: sum,
    };
  }
}

export class FormNode extends Classic.Node implements DataflowNode {
  width = 224;
  height = 102;

  constructor(form: any) {
    super('Form');

    this.addOutput('value', new Classic.Output(socket, 'Number'));
  }
  data() {
    return {
      value: 0,
    };
  }
}

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
