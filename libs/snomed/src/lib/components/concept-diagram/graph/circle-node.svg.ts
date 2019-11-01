import { Component, Input, ChangeDetectorRef, ElementRef } from '@angular/core';

@Component({
  selector: '[circleNode]',
  templateUrl: './circle-node.svg.html'
})
export class CircleNodeComponent {
    @Input() x: number;
    @Input() y: number;
    @Input() type: string;

    get bbox() {
        this.cd.detectChanges();
        return this.el.nativeElement.getBBox();
    }

    constructor(private cd: ChangeDetectorRef, private el: ElementRef) {}
}
