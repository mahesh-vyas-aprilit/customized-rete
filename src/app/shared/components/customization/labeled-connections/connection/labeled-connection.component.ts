import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Connection } from '../models';
import type { ILabelPosition, INode } from 'src/app/shared/types/rete-types';

@Component({
  selector: 'labeled-connection',
  template: `<svg
      data-testid="connection"
      class="workflow-labeled-connection-svg"
      (pointerdown)="$event.stopPropagation()"
    >
      <path class="hover-path" [attr.d]="path" />
      <path #pathREf [attr.d]="path" />
    </svg>

    <!-- Conncetion label -->
    <div
      *ngIf="data.label?.text && data?.label?.text !== ''"
      [style]="{
        transform: 'translate(' + point.x + 'px, ' + point.y + 'px)'
      }"
      class="workflow-label-container"
    >
      <div
        class="workflow-label-wrapper"
        [style]="{
          background: getBackgroudColor(data.labelColor ?? '')
        }"
      >
        <i class="ki-outline ki-{{ data.labelIcon }} workflow-icon"></i>
        <span class="workflow-label-text">{{ text }}</span>
      </div>
    </div> `,
})
export class LabeledConnectionComponent implements OnInit {
  @ViewChild('pathREf', { static: false }) pathREf!: ElementRef<SVGPathElement>;
  @Input() data!: Connection<INode, INode>;
  @Input() start: any;
  @Input() end: any;
  @Input() path!: string;

  text!: string;
  position!: ILabelPosition;
  pathElement!: SVGPathElement;
  backgroundColor: string = '';

  constructor() {}

  ngOnInit(): void {
    if (typeof this.data.label === 'string') {
      this.text = this.data.label;
      this.position = 'center';
    } else {
      this.text = this.data.label?.text ?? '';
      this.position = this.data.label?.position ?? 'center';
    }

    if (this.data.labelColor) {
      this.backgroundColor = this.getBackgroudColor(this.data.labelColor);
    }
  }

  getBackgroudColor(color: string) {
    switch (color) {
      case 'green':
        return '#33D082';
      case 'red':
        return '#FA2222';
      case 'orange':
        return '#FA7E22';
      default:
        return '#33D082';
    }
  }

  get point() {
    if (!this.pathREf) return { x: 0, y: 0 };
    const path = this.pathREf.nativeElement;
    const length = path.getTotalLength();
    const width = this.text.length * 12;

    // Check if the path is not empty
    if (length === 0) {
      return { x: 0, y: 0 };
    }

    let point;
    if (this.position === 'center') {
      point = path.getPointAtLength(length / 2);
    } else {
      point = path.getPointAtLength(
        (this.position === 'start' ? 0 : length) +
          (this.position === 'end' ? -1 : 1) * (width / 2 + 20)
      );
    }

    return point;
  }
}
