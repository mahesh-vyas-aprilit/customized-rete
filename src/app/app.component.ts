import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { SubSink } from 'subsink';
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

  private readonly settings: IReteSettings = {
    isMiniMap: false,
    isReadOnly: false,
    shouldAnimate: true,
  };

  saveModule!: () => IStep[];
  editor!: NodeEditor<ISchemes>;
  area!: AreaPlugin<ISchemes, IAreaExtra>;

  constructor(
    private workflowService: WorkflowService,
    private reteService: ReteService
  ) {}

  ngOnInit() {
    this.subs.add(
      this.workflowService.getData().subscribe((data) => {
        this.apiNodes = data;
      })
    );
    this.subs.add(
      this.reteService.chartUpdate.subscribe(async (data: ReteEvent) => {
        await this.reteService.handleChartUpdate(data);
      })
    );
  }

  async ngAfterViewInit() {
    const { area, editor, saveModule } =
      await this.reteService.createReteEditor(
        this.container.nativeElement,
        this.settings,
        this.apiNodes
      );

    this.editor = editor;
    this.area = area;
    this.saveModule = saveModule;
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
