import {
  AfterViewInit,
  Component,
  ElementRef,
  Injector,
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
export class AppComponent implements AfterViewInit {
  title = 'angular';
  subs = new SubSink();
  apiNodes!: IStep[];
  @ViewChild('rete') container!: ElementRef<HTMLElement>;

  settings: IReteSettings;

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
    await createEditor(
      this.container.nativeElement,
      this.injector,
      this.settings,
      this.apiNodes
    );
  }
}
