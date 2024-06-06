import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { NodeEditor } from 'rete';
import { AreaPlugin } from 'rete-area-plugin';
import { AreaExtra, Node, Schemes } from '../rete';
import { Position } from 'rete-area-plugin/_types/types';
import { SubSink } from 'subsink';
import { WorkflowService } from '../workflow.service';
import { IStep } from '../types';
import { MyNode } from '../customization/nodes';

@Component({
  selector: 'app-drag-drop-strategy-sidebar',
  templateUrl: './drag-drop-strategy-sidebar.component.html',
  styleUrls: ['./drag-drop-strategy-sidebar.component.css'],
})
export class DragDropStrategySidebarComponent implements OnInit, OnChanges {
  @Input() editor!: NodeEditor<Schemes>;
  @Input() area!: AreaPlugin<Schemes, AreaExtra>;
  current?: () => Node;
  subs = new SubSink();
  apiNodes!: IStep[];

  constructor(private workflowService: WorkflowService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['area'].currentValue, changes['editor'].currentValue)) {
      changes['area'].currentValue.container.addEventListener(
        'dragover',
        (e: any) => e.preventDefault()
      );
      changes['area'].currentValue.container.addEventListener(
        'drop',
        async (event: any) => {
          if (!this.current) return;

          try {
            changes['area'].currentValue.area.setPointerFrom(event);
            this.drop(
              this.current(),
              changes['area'].currentValue.area.pointer
            );
          } finally {
            delete this.current;
          }
        }
      );
    }
  }

  ngOnInit(): void {
    this.subs.add(
      this.workflowService.getData().subscribe((data) => (this.apiNodes = data))
    );
  }

  add(item: IStep) {
    const node = new MyNode(item);
    this.current = () => node;
  }

  private async drop(node: Node, position: Position) {
    await this.editor.addNode(node);
    const view = this.area.nodeViews.get(node.id);
    if (!view) throw new Error('view');
    await view.translate(position.x, position.y);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
