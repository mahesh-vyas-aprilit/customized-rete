import { Component } from '@angular/core';
import { SubSink } from 'subsink';
import { IStep } from '../types';
import { WorkflowService } from '../workflow.service';
import { area, editor } from '../rete';
import { MyNode } from '../customization/nodes';

@Component({
  selector: 'app-click-strategy-sidebar',
  templateUrl: './click-strategy-sidebar.component.html',
  styleUrls: ['./click-strategy-sidebar.component.css'],
})
export class ClickStrategySidebarComponent {
  subs = new SubSink();
  apiNodes!: IStep[];

  constructor(private workflowService: WorkflowService) {}

  ngAfterViewInit(): void {
    this.subs.add(
      this.workflowService.getData().subscribe((data) => {
        this.apiNodes = data.filter((t) => !t.isFinalStep);
      })
    );
  }

  async handleAddNodeToCanvas(item: IStep) {
    let node = new MyNode(item);

    await editor.addNode(node);

    const viewportCenter = this.getViewportCenter();
    const view = area.nodeViews.get(node.id);
    if (!view) throw new Error('view');

    // await view?.translate(viewportCenter.x, viewportCenter.y);
  }

  private getViewportCenter() {
    const { x, y, k } = area.area.transform;
    const box = area.container.getBoundingClientRect();
    const halfWidth = box.width / 2 / k;
    const halfHeight = box.height / 2 / k;

    return { x: halfWidth - x / k, y: halfHeight - y / k };
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
