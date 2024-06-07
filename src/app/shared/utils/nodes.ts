import { ClassicPreset as Classic } from 'rete';
import { DataflowNode } from 'rete-engine';
import type { IStep } from '../types';

/**
 * Creates a new socket instance for connecting nodes.
 * @type {Classic.Socket}
 */
const socket: Classic.Socket = new Classic.Socket('socket');

/**
 * Custom node class that extends the Classic.Node class.
 * Represents a generic node with input and output sockets.
 *
 * @class MyNode
 * @extends {Classic.Node}
 */
export class MyNode extends Classic.Node {
  width = 309;
  height = 82;
  stepData: IStep;

  /**
   * Creates an instance of MyNode.
   * @param {IStep} stepData - Data associated with the node.
   */
  constructor(stepData: IStep) {
    super(stepData.stepName);
    this.stepData = stepData;
    this.addInput('value', new Classic.Input(socket, undefined, true));
    this.addOutput('value', new Classic.Output(socket));
  }

  /**
   * Returns initial data for the node.
   * @returns {Object} An object with default values.
   */
  data(): object {
    return {
      value: 0,
    };
  }
}

/**
 * Custom node class that extends the Classic.Node class and implements DataflowNode interface.
 * Represents the starting node in a dataflow with an output socket.
 *
 * @class StartingNode
 * @extends {Classic.Node}
 * @implements {DataflowNode}
 */
export class StartingNode extends Classic.Node implements DataflowNode {
  width = 309;
  height = 82;
  stepData: IStep;

  /**
   * Creates an instance of StartingNode.
   * @param {IStep} stepData - Data associated with the node.
   */
  constructor(stepData: IStep) {
    super(stepData.stepName);
    this.stepData = stepData;
    this.addOutput('value', new Classic.Output(socket));
  }

  /**
   * Returns data for the node, extracting the value from the controls.
   * @returns {Object} An object with the current value from the node's controls.
   */
  data(): object {
    const value = (this.controls['value'] as Classic.InputControl<'text'>)
      .value;

    return {
      value,
    };
  }
}

/**
 * Custom node class that extends the Classic.Node class and implements DataflowNode interface.
 * Represents the ending node in a dataflow with an input socket.
 *
 * @class EndNode
 * @extends {Classic.Node}
 * @implements {DataflowNode}
 */
export class EndNode extends Classic.Node implements DataflowNode {
  width = 103;
  height = 54;
  stepData: IStep;

  /**
   * Creates an instance of EndNode.
   * @param {IStep} stepData - Data associated with the node.
   */
  constructor(stepData: IStep) {
    super(stepData.stepName);
    this.stepData = stepData;
    this.addInput('value', new Classic.Input(socket));
  }

  /**
   * Returns data for the node, extracting the value from the controls.
   * @returns {Object} An object with the current value from the node's controls.
   */
  data(): object {
    const value = (this.controls['value'] as Classic.InputControl<'text'>)
      .value;

    return {
      value,
    };
  }
}
