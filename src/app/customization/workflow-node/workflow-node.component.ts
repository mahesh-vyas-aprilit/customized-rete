import {
  Component,
  Input,
  HostBinding,
  ChangeDetectorRef,
  OnChanges,
} from '@angular/core';
import { EndNode, MyNode, StartingNode } from '../nodes';

@Component({
  templateUrl: './workflow-node.component.html',
  styleUrls: ['./workflow-node.component.scss'],
  host: {
    'data-testid': 'node',
  },
})
export class WorkflowNodeComponent implements OnChanges {
  @Input() data!: MyNode | StartingNode | EndNode;
  @Input() emit!: (data: any) => void;
  @Input() rendered!: () => void;
  // dynamicBgColor: string = '';
  seed = 0;

  @HostBinding('class.selected') get selected() {
    return this.data.selected;
  }

  // @HostBinding('class.group') get group() {
  //   return true;
  // }

  @HostBinding('class.end-node') get padding() {
    return this.data.isEndNode;
  }

  // @HostBinding('style.backgroundColor') get bgColor() {
  //   return this.getBackgroundColor(this.dynamicBgColor);
  // }
  // @HostBinding('style.borderColor') get borderColor() {
  //   return this.getBorderColor(this.dynamicBgColor);
  // }

  // getBorderColor(color: string) {
  //   switch (color) {
  //     case 'orange':
  //       return '#FA7E2233';
  //     case 'red':
  //       return '#FA225633';
  //     case 'green':
  //       return '#33D082';
  //     case 'purple':
  //       return '#9766FF33';
  //     case 'blue':
  //       return '#2F82EB33';
  //     default:
  //       return '#FA7E2214';
  //   }
  // }

  // getBackgroundColor(color: string) {
  //   switch (color) {
  //     case 'orange':
  //       return '#FA7E2214';
  //     case 'red':
  //       return '#FA225614';
  //     case 'green':
  //       return '#33D08214';
  //     case 'purple':
  //       return '#9766FF14';
  //     case 'blue':
  //       return '#2F82EB14';
  //     default:
  //       return '#FA7E2214';
  //   }
  // }

  constructor(private cdr: ChangeDetectorRef) {
    this.cdr.detach();
  }

  ngOnChanges(): void {
    // this.dynamicBgColor = this.data.bgColor || '';
    this.cdr.detectChanges();
    requestAnimationFrame(() => this.rendered());
    this.seed++; // force render sockets
  }

  sortByIndex(a: any, b: any) {
    const ai = a.value.index || 0;
    const bi = b.value.index || 0;

    return ai - bi;
  }
}
