import {
  AfterViewInit,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { SubSink } from 'subsink';
import { createEditor } from './shared/rete';
import { WorkflowService } from './shared/services/workflow.service';
import { type ReteEvent, ReteService } from './shared/services/rete.service';
import type { IReteSettings, IStep } from './shared/types';
import type { NodeEditor } from 'rete';
import type { AreaPlugin } from 'rete-area-plugin';
import type { IAreaExtra, ISchemes } from './shared/types/rete-types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  title = 'angular';
  subs = new SubSink();
  apiNodes!: IStep[];
  @ViewChild('rete') container!: ElementRef<HTMLElement>;

  settings: IReteSettings;

  saveModule!: () => IStep[];
  editor!: NodeEditor<ISchemes>;
  area!: AreaPlugin<ISchemes, IAreaExtra>;

  constructor(
    private injector: Injector,
    private workflowService: WorkflowService,
    private reteService: ReteService
  ) {
    this.settings = {
      isMiniMap: false,
      isReadOnly: false,
      shouldAnimate: true,
    };
  }

  ngOnInit() {
    this.subs.add(
      this.workflowService.getData().subscribe((data) => {
        this.apiNodes = data;
      })
    );
    this.subs.add(
      this.reteService.chartUpdate.subscribe(async (data: ReteEvent) => {
        switch (data.type) {
          case 'nodeAdded':
            await this.editor.addNode(data.data);
            break;
          case 'nodeDeleted':
            const connections = this.editor.getConnections().filter((c) => {
              return c.source === data.data || c.target === data.data;
            });
            for (const connection of connections) {
              await this.editor.removeConnection(connection.id);
            }
            await this.editor.removeNode(data.data);
            break;

          case 'nodeAddedWithClick':
            await this.editor.addNode(data.data);
            // const viewportCenter = getViewportCenter(this.area);
            // const view = this.area.nodeViews.get(data.data.id);
            // if (!view) throw new Error('view');

            // await view?.translate(viewportCenter.x, viewportCenter.y);
            break;
          default:
            break;
        }
      })
    );
  }

  async createEditor() {
    const { editor, area, saveModule } = await createEditor(
      this.container.nativeElement,
      this.injector,
      this.settings,
      this.apiNodes
    );

    this.editor = editor;
    this.area = area;
    this.saveModule = saveModule;
  }

  async ngAfterViewInit() {
    await this.createEditor();
  }

  handleSaveChart() {
    const data = this.saveModule();
    this.subs.add(this.workflowService.saveData(data).subscribe());
  }

  handleStoreInitialData() {
    this.workflowService.storeDataInLocalStorage();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
