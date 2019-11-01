import { Component, Input } from '@angular/core';
import { SnomedAPI } from '../../../services/snomed.service';

@Component({
    selector: 'app-concept-stats',
    templateUrl: './concept-stats.component.html',
    styleUrls: ['./concept-stats.component.scss']
})
export class AppConceptStatsComponent {
    @Input() concept;
    constructor(
        public snomed: SnomedAPI
    ) {

    }
}
