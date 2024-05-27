import { Component, Input } from '@angular/core';
import { Connection } from '../labeled-connections';
import { Node } from 'src/app/rete';

@Component({
  selector: 'connection',
  template: `
    <svg data-testid="connection">
      <path [attr.d]="path" />
    </svg>
  `,
  styleUrls: ['./custom-connection.component.sass'],
})
export class CustomConnectionComponent {
  @Input() data!: Connection<Node, Node>;
  // @Input() data!: ClassicPreset.Connection<
  //   ClassicPreset.Node,
  //   ClassicPreset.Node
  // >;
  @Input() start: any;
  @Input() end: any;
  @Input() path!: string;
}
