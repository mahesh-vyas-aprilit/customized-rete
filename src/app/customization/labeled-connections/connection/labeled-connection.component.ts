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
        class="absolute -translate-x-1/2  text-white rounded-xl whitespace-pre py-[0.2em] px-[0.6em] flex items-center gap-2"
        [style]="{
          background: data.labelColor ?? '#5082b6'
        }"
      >
        <i class="ki-outline ki-{{ data.labelIcon }}"></i>
        <span>{{ text }}</span>
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

  constructor() {}

  ngOnInit(): void {
    if (typeof this.data.label === 'string') {
      this.text = this.data.label;
      this.position = 'center';
    } else {
      this.text = this.data.label?.text ?? '';
      this.position = this.data.label?.position ?? 'center';
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
