import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { CustomSocketComponent } from './shared/components/customization/custom-socket/custom-socket.component';
import { ReteModule } from 'rete-angular-plugin/16';
import { WorkflowNodeComponent } from './shared/components/customization/workflow-node/workflow-node.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LabeledConnectionComponent } from './shared/components/customization/labeled-connections';
import { WorkflowService } from './shared/services/workflow.service';
import { ClickStrategySidebarComponent } from './shared/components/click-strategy-sidebar/click-strategy-sidebar.component';
import { DragDropStrategySidebarComponent } from './shared/components/drag-drop-strategy-sidebar/drag-drop-strategy-sidebar.component';

@NgModule({
  declarations: [
    AppComponent,
    CustomSocketComponent,
    WorkflowNodeComponent,
    LabeledConnectionComponent,
    ClickStrategySidebarComponent,
    DragDropStrategySidebarComponent,
  ],
  imports: [BrowserModule, ReteModule, BrowserAnimationsModule],
  providers: [WorkflowService],
  bootstrap: [AppComponent],
})
export class AppModule {}
