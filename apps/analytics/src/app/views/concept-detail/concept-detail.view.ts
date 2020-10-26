import { Component, ViewChild } from '@angular/core';
import { getConceptOperator, SnomedAPI } from '../../services/snomed.service';
import { QueryOptionsService } from '../../services/query-filter.service';
import { combineLatest, Observable } from 'rxjs';
import { tap, pluck, switchAll, switchMap, map } from 'rxjs/operators';
import { ActivationEnd, ActivatedRoute, Router } from '@angular/router';
import { cache } from '../../operators';
import { IConcept } from '@andes-analytics/snomed';
import { constructor } from 'moment';

@Component({
    selector: 'app-concept-detail-view',
    templateUrl: './concept-detail.view.html',
    styleUrls: ['./concept-detail.view.scss']
})
export class AppConceptDetailView {
    public concept$;

    public refSetLanguage = {
        conceptId: '450828004',
        term: 'conjunto de referencias de lenguaje castellano para América Latina'
    };

    public term$: Observable<any>;
    public language = 'es';

    histograma$ : Observable<any>;

    constructor(
        private snomed: SnomedAPI,
        public qf: QueryOptionsService,
        private activeRoute: ActivatedRoute,
        private router: Router
    ) {
        this.activeRoute.queryParams.subscribe(({ language }) => {
            this.language = language;
        })
        this.concept$ = getConceptOperator(this.activeRoute).pipe(
            switchMap(([conceptId, language]) => this.snomed.concept(conceptId, language)),
            tap(concept => {
                if (concept) {
                    this.term$ = this.snomed.terms(concept.conceptId);
                } else {
                    this.term$ = null;
                } 
            }),
            cache()
        );

        this.histograma$ = this.concept$.pipe(
            switchMap((concept: IConcept) => this.snomed.analytics(concept.conceptId, 'count', 'fecha'))
        )
    }

    onSelected(concept) {
        const url = this.router.url;
        const urlParts = url.split('/');
        this.router.navigate(['concept', concept.conceptId, 'detail'], { queryParamsHandling: 'preserve' });
    }               
}
