import { Component, Input } from '@angular/core';
import { SnomedAPI } from '../../services/snomed.service';

@Component({
    selector: 'concept-count-pill',
    templateUrl: './concept-count-pill.component.html'
})
export class ConceptCountPillComponent {
    @Input() concept: any;
    constructor(
        public snomed: SnomedAPI
    ) {

    }
}
