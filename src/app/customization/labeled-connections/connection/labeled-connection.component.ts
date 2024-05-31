import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Connection, LabelPosition } from '../models';
import { Node } from 'src/app/rete';

@Component({
  selector: 'labeled-connection',
  template: `<svg
      data-testid="connection"
      (pointerdown)="$event.stopPropagation()"
    >
      <path class="hover-path" [attr.d]="path" />
      <path #pathREf [attr.d]="path" />
    </svg>

    <!-- Conncetion label -->
    <div
      [style]="{
        transform: 'translate(' + point.x + 'px, ' + point.y + 'px)'
      }"
      class="absolute top-0 left-0 block z-[2]"
    >
      <div
        class="absolute -translate-x-1/2 -translate-y-1/2  whitespace-pre py-[2px] px-[15px] flex items-center gap-2 text-sm leading-5 rounded-[5px]"
        [style]="{
          background: getBackgroudColor(data.labelColor ?? ''),
          color: getForegroundColor(data.labelColor ?? '')
        }"
      >
        <i class="ki-outline ki-{{ data.labelIcon }} text-2xl leading-none"></i>
        <span class="font-medium">{{ text }}</span>
      </div>
    </div> `,
  styleUrls: ['./labeled-connection.component.scss'],
})
export class LabeledConnectionComponent implements OnInit {
  @ViewChild('pathREf', { static: false }) pathREf!: ElementRef<SVGPathElement>;
  @Input() data!: Connection<Node, Node>;
  @Input() start: any;
  @Input() end: any;
  @Input() path!: string;

  text!: string;
  position!: LabelPosition;
  pathElement!: SVGPathElement;
  backgroundColor: string = '';
  foregroundColor: string = '';

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
      this.foregroundColor = this.getForegroundColor(this.data.labelColor);
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

  getForegroundColor(color: string) {
    switch (color) {
      case 'green':
        return '#0B0F21';
      default:
        return '#FFFFFF';
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
