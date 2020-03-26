import { Component, Input } from '@angular/core';
import { SnomedAPI } from '../../services/snomed.service';

@Component({
    selector: 'concept-definition-status-icon',
    template: `
        <span class="definition-status-icon">
            {{ concept.definitionStatus !== 'PRIMITIVE' ? '≡' : '&nbsp;&nbsp;' }}
        </span>
    `,
    styles: [`
        .definition-status-icon {
            display: inline-block; 
            font-weight: 700;
            line-height: 1;
            text-align: center;
            white-space: nowrap;
            vertical-align: baseline;
            padding: 3px 7px;   
            border-radius: 10px;
            color: #856404;
            background-color: #fff3cd;
            border-color: #ffeeba;
        }
    
    `]
})
export class ConceptDefinitionStatusIconComponent {
    @Input() concept: any;
    constructor(
        public snomed: SnomedAPI
    ) {

    }
}
