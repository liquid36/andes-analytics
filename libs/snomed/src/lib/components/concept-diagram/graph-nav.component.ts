import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'snd-concept-diagram',
    templateUrl: './graph-nav.component.html',
    styleUrls: ['./graph-nav.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SndGraphNavComponent {
    @Input() concept: any;
    @Input() form = 'INFERRED_RELATIONSHIP';
    @Output() conceptClick = new EventEmitter<any>();

    public initialX = 10;
    public initialY = 10;

    get circle1X() {
        return this.initialX + 90;
    }

    get circle1Y() {
        return this.initialY + 40 + 40;
    }

    get circle2X() {
        return this.circle1X + 55;
    }

    get circle2Y() {
        return this.circle1Y;
    }

    get initialIsARelX() {
        return this.circle2X + 40;
    }

    get initialIsARelY() {
        return this.circle2Y - 18;
    }

    get initialZeroAttributeY() {
        return this.circle2Y - 18 + this.isARel.length * (39 + 25);
    }

    get initialGroupAttributeY() {
        return this.initialZeroAttributeY + this.zeroAttribute.length * (39 + 25) + 15;
    }

    offsetGroupAttrY(index) {
        let y = 0;
        for (let i = 1; i <= index; i++) {
            y += this.getAttributeGroup[i - 1].length * (39 + 25);
        }
        return y;
    }

    get isPrimitive() {
        return this.concept.definitionStatus === 'PRIMITIVE';
    }

    get isARel() {
        if (this.concept) {
            return this.concept.relationships.filter((rel) => rel.active && rel.target)
                .filter(rel => rel.type.conceptId === '116680003')
                .filter(rel => rel.characteristicType === this.form);
        }
        return [];
    }

    get zeroAttribute() {
        if (this.concept) {
            return this.concept.relationships.filter((rel) => rel.active && rel.target)
                .filter(rel => rel.type.conceptId !== '116680003')
                .filter(rel => rel.groupId === 0)
                .filter(rel => rel.characteristicType === this.form);
        }
        return [];
    }

    get getAttributeGroup() {
        const maxGroup = this.concept.relationships
            .filter((rel) => rel.active && rel.target)
            .filter(rel => rel.type.conceptId !== '116680003')
            .filter(rel => rel.characteristicType === this.form)
            .reduce((a, b) => Math.max(a, b.groupId), 0);
        const result = [];
        for (let i = 1; i <= maxGroup; i++) {
            result.push(
                this.concept.relationships
                    .filter((rel) => rel.active && rel.target)
                    .filter(rel => rel.type.conceptId !== '116680003')
                    .filter(rel => rel.characteristicType === this.form)
                    .filter(rel => rel.groupId === i)
            );
        }
        return result;
    }

    constructor() { }

    selectConcept(concept) {
        this.conceptClick.emit(concept);
    }

}
