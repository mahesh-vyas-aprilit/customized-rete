import { Component } from '@angular/core';
import { SubSink } from 'subsink';
import { IStep } from '../../types';
import { WorkflowService } from '../../services/workflow.service';
import { MyNode } from '../../utils/nodes';
import { ReteService } from '../../services/rete.service';

@Component({
  selector: 'app-click-strategy-sidebar',
  templateUrl: './click-strategy-sidebar.component.html',
  styleUrls: ['./click-strategy-sidebar.component.css'],
})
export class ClickStrategySidebarComponent {
  subs = new SubSink();
  apiNodes!: IStep[];

  constructor(
    private workflowService: WorkflowService,
    private reteService: ReteService
  ) {}

  ngAfterViewInit(): void {
    this.subs.add(
      this.workflowService.getData().subscribe((data) => {
        this.apiNodes = data.filter((t) => !t.isFinalStep);
      })
    );
  }

  async handleAddNodeToCanvas(item: IStep) {
    let node = new MyNode(item);

    this.reteService.triggerEvent({ type: 'nodeAdded', data: node });

    // const viewportCenter = this.getViewportCenter();
    // const view = area.nodeViews.get(node.id);
    // if (!view) throw new Error('view');

    // await view?.translate(viewportCenter.x, viewportCenter.y);
  }

  // private getViewportCenter() {
  //   const { x, y, k } = this.area.area.transform;
  //   const box = this.area.container.getBoundingClientRect();
  //   const halfWidth = box.width / 2 / k;
  //   const halfHeight = box.height / 2 / k;

  //   return { x: halfWidth - x / k, y: halfHeight - y / k };
  // }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}