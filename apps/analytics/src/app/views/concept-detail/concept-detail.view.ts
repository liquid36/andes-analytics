import { Component, ViewChild } from '@angular/core';
import { SnomedAPI } from '../../services/snomed.service';
import { QueryOptionsService } from '../../services/query-filter.service';
import { Observable } from 'rxjs';
import { tap, pluck, switchAll, switchMap, map } from 'rxjs/operators';
import { ActivationEnd, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-concept-detail-view',
    templateUrl: './concept-detail.view.html'
})
export class AppConceptDetailView {
    public concept$;

    public refSetLanguage = {
        conceptId: '231000013101',
        term: 'conjunto de referencias de lenguaje para la extensión provincial de Neuquén '
    };

    public term$: Observable<any>;

    constructor(
        private snomed: SnomedAPI,
        public qf: QueryOptionsService,
        private activeRoute: ActivatedRoute
    ) {
        // this.concept$ = this.qf.onConcept().pipe(
        this.concept$ = this.activeRoute.paramMap.pipe(
            map((dto: any) => dto.params),
            pluck('id'),
            switchMap((conceptId) => this.snomed.concept(conceptId)),
            tap(concept => {
                if (concept) {
                    this.term$ = this.snomed.terms(concept.conceptId);
                } else {
                    this.term$ = null;
                }
            })
        );
    }

}
