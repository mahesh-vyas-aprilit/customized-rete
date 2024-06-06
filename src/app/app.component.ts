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
import { AreaExtra, Schemes, createEditor } from './rete';
import { WorkflowService } from './workflow.service';
import { IReteSettings, IStep } from './types';
import { ReteEvent, ReteService } from './services/rete.service';
import { NodeEditor } from 'rete';
import { AreaPlugin } from 'rete-area-plugin';

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
  editor!: NodeEditor<Schemes>;
  area!: AreaPlugin<Schemes, AreaExtra>;

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
