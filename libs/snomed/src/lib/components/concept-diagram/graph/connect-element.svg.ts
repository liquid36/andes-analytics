import { Component, Input } from '@angular/core';

interface BBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

@Component({
  selector: '[connectElement]',
  templateUrl: './connect-element.svg.html'
})
export class ConnectElementComponent {
    @Input() from: BBox;
    @Input() to: BBox;
    @Input() sideFrom: string;
    @Input() sideTo: string;
    @Input() endMarker = 'BlackTriangle';

    get points() {
        if (!this.from || !this.to) { return; }
        const rect1cx = this.from.x;
        const rect1cy = this.from.y;
        const rect1cw = this.from.width;
        const rect1ch = this.from.height;

        const rect2cx = this.to.x;
        const rect2cy = this.to.y ;
        const rect2cw = this.to.width;
        const rect2ch = this.to.height;

        const markerCompensantion1 = 15;
        const markerCompensantion2 = 15;

        let originX;
        let originY;
        let destinationX;
        let destinationY;

        switch (this.sideFrom) {
            case 'top':
                originY = rect1cy;
                originX = rect1cx + (rect1cw / 2);
                break;
            case 'bottom':
                originY = rect1cy + rect1ch;
                originX = rect1cx + (rect1cw / 2);
                break;
            case 'left':
                originX = rect1cx - markerCompensantion1;
                originY = rect1cy + (rect1ch / 2);
                break;
            case 'right':
                originX = rect1cx + rect1cw;
                originY = rect1cy + (rect1ch / 2);
                break;
            case 'bottom-50':
                originY = rect1cy + rect1ch;
                originX = rect1cx + 40;
                break;
            default:
                originX = rect1cx + (rect1cw / 2);
                originY = rect1cy + (rect1ch / 2);
                break;
        }

        switch (this.sideTo) {
            case 'top':
                destinationY = rect2cy;
                destinationX = rect2cx + (rect2cw / 2);
                break;
            case 'bottom':
                destinationY = rect2cy + rect2ch;
                destinationX = rect2cx + (rect2cw / 2);
                break;
            case 'left':
                destinationX = rect2cx - markerCompensantion2;
                destinationY = rect2cy + (rect2ch / 2);
                break;
            case 'right':
                destinationX = rect2cx + rect2cw;
                destinationY = rect2cy + (rect2ch / 2);
                break;
            case 'bottom-50':
                destinationY = rect2cy + rect2ch;
                destinationX = rect2cx + 50;
                break;
            default:
                destinationX = rect2cx + (rect2cw / 2);
                destinationY = rect2cy + (rect2ch / 2);
                break;
        }
        return `${originX},${originY} ${originX},${destinationY} ${destinationX},${destinationY}`;
    }
}
