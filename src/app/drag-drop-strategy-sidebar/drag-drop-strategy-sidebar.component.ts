import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { area, editor } from '../rete';
import { Position } from 'rete-area-plugin/_types/types';
import { EndNode, MyNode, StartingNode } from '../customization/nodes';
import { WorkflowService } from '../workflow.service';
import { SubSink } from 'subsink';
import { IStep } from '../types';
import { DropStrategy } from '../plugins/drop-strategyV2';
import { Strategy, StrategyV2 } from '../plugins/dock-plugin/strategy';
type CustomNode = MyNode | StartingNode | EndNode;
@Component({
  selector: 'app-drag-drop-strategy-sidebar',
  templateUrl: './drag-drop-strategy-sidebar.component.html',
  styleUrls: ['./drag-drop-strategy-sidebar.component.css'],
})
export class DragDropStrategySidebarComponent {
  @ViewChild('dockContainer') dockContainer!: ElementRef;
  subs = new SubSink();
  apiNodes!: IStep[];
  current?: CustomNode;
  dropStrategy!: StrategyV2;
  constructor(private renderer: Renderer2) {}

  // ngAfterViewInit(): void {
  // const nodeElement = this.dockContainer.nativeElement.querySelector(
  //   '[data-testid="node"]'
  // );
  // if (nodeElement) {
  //   this.renderer.setStyle(nodeElement, 'display', 'none');
  // }
  // const nodeElements = this.dockContainer.nativeElement.querySelectorAll(
  //   '.data-node-container'
  // );
  // console.log(nodeElements);
  // nodeElements.forEach((nodeElement: Element) => {
  //   this.renderer.;
  // });
  // this.subs.add(
  //   this.workflowService.getData().subscribe((data) => {
  //     this.apiNodes = data.filter((t) => !t.isFinalStep);
  //   })
  // );
  // if (area) {
  //   this.dropStrategy = new DropStrategy(editor, area);
  // }
  // if (area) {
  //   area.container.addEventListener('dragover', (e) => e.preventDefault());
  //   area.container.addEventListener('drop', async (event) => {
  //     if (!this.current) return;
  //     try {
  //       area.area.setPointerFrom(event);
  //       this.drop(this.current, area.area.pointer);
  //     } finally {
  //       delete this.current;
  //     }
  //   });
  // }
  // }

  // add(element: HTMLElement, create: () => CustomNode) {
  //   element.draggable = true;

  //   element.addEventListener('dragstart', () => {
  //     this.current = create;
  //   });
  // }

  handleDragAndDropElement(item: IStep) {
    if (area) {
      let node = new MyNode(
        item.stepName,
        item.icon,
        item.color,
        item.description
      );
      // this.current = node;
      this.dropStrategy.add('', node);
      console.log(this.current);
    }
  }

  private async drop(node: CustomNode, position: Position) {
    await editor.addNode(node);

    const view = area.nodeViews.get(node.id);

    if (!view) throw new Error('view');

    await view.translate(position.x, position.y);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
