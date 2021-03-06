import { Component, Input, Output, TemplateRef, EventEmitter } from '@angular/core';
import { SnomedHTTP } from '../../services/snomed.http';

@Component({
    selector: 'snd-concept-parents',
    templateUrl: './concept-parents.component.html',
    styleUrls: ['./concept-parents.component.scss']
})
export class ConceptParentsComponent {
    public static ISA = '116680003';
    public static INFERRED = 'INFERRED_RELATIONSHIP';
    public static STATED = 'STATED_RELATIONSHIP';

    constructor(private api: SnomedHTTP) { }

    private conceptTemp;
    public relatioships: any[];


    @Input() iconTemplate: TemplateRef<any>;

    @Input() form = 'inferred';
    @Input() language = 'es';
    @Input() set concept(value) {
        this.conceptTemp = value;

        const characteristicType = this.form === 'stated' ? ConceptParentsComponent.STATED : ConceptParentsComponent.INFERRED;

        if (this.conceptTemp.relationships) {
            this.relatioships = this.conceptTemp.relationships
                .filter(e => e.active)
                .filter(e => e.characteristicType === characteristicType)
                .filter(e => e.type.conceptId === ConceptParentsComponent.ISA)
                .map(e => { e.target._level = 0; return e.target; });
        } else {
            this.relatioships = [];
        }
    }

    @Output() conceptClick = new EventEmitter();

    onSelect(concept) {
        this.conceptClick.emit(concept);
    }

    getParents(relationship, index) {
        if (!relationship._expanded && relationship.conceptId !== '138875005') {
            this.api.parents(relationship.conceptId, { form: this.form, language: this.language }).subscribe(parents => {
                relationship._expanded = true;
                parents.forEach(e => e._level = relationship._level + 1);
                this.relatioships = [
                    ...this.relatioships.slice(0, index > 0 ? index : 0),
                    ...parents,
                    ...this.relatioships.slice(index)
                ];
            });
        } else {
            relationship._expanded = false;
            const myLevel = relationship._level;
            for (let i = index - 1; i >= 0; i--) {
                if (this.relatioships[i]._level > myLevel) {
                    this.relatioships.splice(i, 1);
                } else if (this.relatioships[i]._level === myLevel) {
                    break;
                }
            }
            this.relatioships = [...this.relatioships];
        }
    }
}
