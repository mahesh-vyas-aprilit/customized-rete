import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { SubSink } from 'subsink';
import { WorkflowService } from '../../services/workflow.service';
import { MyNode } from '../../utils/nodes';
import type { NodeEditor } from 'rete';
import type { AreaPlugin } from 'rete-area-plugin';
import type { IPosition, IStep } from '../../types';
import type { IAreaExtra, ISchemes, INode } from '../../types/rete-types';

@Component({
  selector: 'app-drag-drop-strategy-sidebar',
  templateUrl: './drag-drop-strategy-sidebar.component.html',
  styleUrls: ['./drag-drop-strategy-sidebar.component.css'],
})
export class DragDropStrategySidebarComponent
  implements OnInit, OnChanges, OnDestroy
{
  @Input() editor!: NodeEditor<ISchemes>;
  @Input() area!: AreaPlugin<ISchemes, IAreaExtra>;
  current?: () => INode;
  subs = new SubSink();
  apiNodes!: IStep[];

  constructor(private workflowService: WorkflowService) {}

  ngOnChanges(changes: SimpleChanges): void {
    // if ((changes['area'].currentValue, changes['editor'].currentValue)) {
    //   changes['area'].currentValue.container.addEventListener(
    //     'dragover',
    //     (e: any) => e.preventDefault()
    //   );
    //   changes['area'].currentValue.container.addEventListener(
    //     'drop',
    //     async (event: any) => {
    //       if (!this.current) return;
    //       try {
    //         changes['area'].currentValue.area.setPointerFrom(event);
    //         this.drop(
    //           this.current(),
    //           changes['area'].currentValue.area.pointer
    //         );
    //       } finally {
    //         delete this.current;
    //       }
    //     }
    //   );
    // }
  }

  ngOnInit(): void {
    this.subs.add(
      this.workflowService.getData().subscribe((data) => (this.apiNodes = data))
    );

    if ((this.area, this.editor)) {
      this.area.container.addEventListener('dragover', (e: any) =>
        e.preventDefault()
      );
      this.area.container.addEventListener('drop', async (event: any) => {
        if (!this.current) return;

        try {
          this.area.area.setPointerFrom(event);
          this.drop(this.current(), this.area.area.pointer);
        } finally {
          delete this.current;
        }
      });
    }
  }

  add(item: IStep) {
    const node = new MyNode(item);
    this.current = () => node;
  }

  private async drop(node: INode, position: IPosition) {
    await this.editor.addNode(node);
    const view = this.area.nodeViews.get(node.id);
    if (!view) throw new Error('view');
    await view.translate(position.x, position.y);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
