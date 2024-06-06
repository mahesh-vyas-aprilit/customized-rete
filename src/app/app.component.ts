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
import { createEditor } from './rete';
import { WorkflowService } from './workflow.service';
import { IReteSettings, IStep } from './types';

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

  constructor(
    private injector: Injector,
    private workflowService: WorkflowService
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
  }

  async ngAfterViewInit() {
    const { saveModule } = await createEditor(
      this.container.nativeElement,
      this.injector,
      this.settings,
      this.apiNodes
    );

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
