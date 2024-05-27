import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { CustomSocketComponent } from './customization/custom-socket/custom-socket.component';
import { CustomNodeComponent } from './customization/custom-node/custom-node.component';
import { CustomConnectionComponent } from './customization/custom-connection/custom-connection.component';

import { ReteModule } from 'rete-angular-plugin/16';
import { VerticalNodeComponent } from './customization/vertical-node/vertical-node.component';
import { WorkflowNodeComponent } from './customization/workflow-node/workflow-node.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LabeledConnectionComponent } from './customization/labeled-connections';
import { WorkflowService } from './workflow.service';

@NgModule({
  declarations: [
    AppComponent,
    CustomSocketComponent,
    CustomNodeComponent,
    CustomConnectionComponent,
    VerticalNodeComponent,
    WorkflowNodeComponent,
    LabeledConnectionComponent,
  ],
  imports: [BrowserModule, ReteModule, BrowserAnimationsModule],
  providers: [WorkflowService],
  bootstrap: [AppComponent],
})
export class AppModule {}
