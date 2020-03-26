import { Component, Input, EventEmitter, Output, TemplateRef } from '@angular/core';
import { SnomedHTTP } from '../../services/snomed.http';

@Component({
    selector: 'snd-concept-childrens',
    templateUrl: './concept-childrens.component.html',
    styleUrls: ['./concept-childrens.component.scss']
})
export class ConceptChildrensComponent {
    public static ISA = '116680003';
    public static INFERRED = 'INFERRED_RELATIONSHIP';
    public static STATED = 'STATED_RELATIONSHIP';

    constructor(private snomed: SnomedHTTP) { }

    private conceptTemp;
    public relatioships: any[] = [];

    @Input() iconTemplate: TemplateRef<any>;
    @Input() form = 'inferred';
    @Input() set concept(value) {
        this.conceptTemp = value;
        this.snomed.children(value.conceptId, { form: this.form }).subscribe(children => {
            children.forEach(e => e._level = 0);
            this.relatioships = children;
        });
    }
    @Output() conceptClick = new EventEmitter();

    onSelect(concept) {
        this.conceptClick.emit(concept);
    }

    getChildren(relationship, index) {
        if (!relationship._expanded && relationship.conceptId !== '138875005') {
            this.snomed.children(relationship.conceptId, { form: this.form }).subscribe(children => {
                relationship._expanded = true;
                children.forEach(e => e._level = relationship._level + 1);
                this.relatioships = [
                    ...this.relatioships.slice(0, index + 1),
                    ...children,
                    ...this.relatioships.slice(index + 1)
                ];
            });
        } else {
            relationship._expanded = false;
            const myLevel = relationship._level;
            for (let i = index + 1; i < this.relatioships.length; i++) {
                if (this.relatioships[i]._level > myLevel) {
                    this.relatioships.splice(i, 1);
                    i--;
                } else if (this.relatioships[i]._level === myLevel) {
                    break;
                }
            }
            this.relatioships = [...this.relatioships];
        }
    }
}
