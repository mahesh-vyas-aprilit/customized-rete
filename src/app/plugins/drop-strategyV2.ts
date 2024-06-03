import { BaseSchemes, NodeEditor } from 'rete';
import { AreaPlugin } from 'rete-area-plugin';
import { Position } from 'rete-area-plugin/_types/types';

import { Strategy } from './dock-plugin/strategy';
import { EndNode, MyNode, StartingNode } from '../customization/nodes';
type CustomNode = MyNode | StartingNode | EndNode;
export class DropStrategy<K> {
  current?: CustomNode;

  constructor(
    private editor: NodeEditor<BaseSchemes>,
    private area: AreaPlugin<BaseSchemes, K>
  ) {
    area.container.addEventListener('dragover', (e) => e.preventDefault());
    area.container.addEventListener('drop', async (event) => {
      if (!this.current) return;

      try {
        this.area.area.setPointerFrom(event);
        this.drop(this.current, this.area.area.pointer);
      } finally {
        delete this.current;
      }
    });
  }

  add(str: string, create: CustomNode) {
    // element.addEventListener('dragstart', () => {
    this.current = create;
    // });
  }
  //   add(element: HTMLElement, create: () => CustomNode) {
  //     element.draggable = true;

  //     element.addEventListener('dragstart', () => {
  //       this.current = create;
  //     });
  //   }

  private async drop(node: CustomNode, position: Position) {
    await this.editor.addNode(node);

    const view = this.area.nodeViews.get(node.id);

    if (!view) throw new Error('view');

    await view.translate(position.x, position.y);
  }
}
