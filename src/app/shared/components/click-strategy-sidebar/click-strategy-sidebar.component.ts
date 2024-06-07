import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { SubSink } from 'subsink';
import type { IStep } from '../../types';
import { WorkflowService } from '../../services/workflow.service';
import { MyNode } from '../../utils/nodes';
import { ReteService } from '../../services/rete.service';

@Component({
  selector: 'app-click-strategy-sidebar',
  templateUrl: './click-strategy-sidebar.component.html',
  styleUrls: ['./click-strategy-sidebar.component.css'],
})
export class ClickStrategySidebarComponent implements AfterViewInit, OnDestroy {
  subs = new SubSink();
  apiNodes!: IStep[];

  /**
   * Creates an instance of ClickStrategySidebarComponent.
   * @param {WorkflowService} workflowService - The service for workflow operations.
   * @param {ReteService} reteService - The service for Rete operations.
   */
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

  /**
   * Handles adding a new node to the canvas.
   * @param {IStep} item - The step item to be added as a node.
   * @returns {Promise<void>}
   */
  async handleAddNodeToCanvas(item: IStep): Promise<void> {
    let node = new MyNode(item);
    this.reteService.triggerEvent({ type: 'nodeAddedWithClick', data: node });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
