import { Component } from '@angular/core';
import { getConceptOperator, SnomedAPI } from '../../services/snomed.service';
import { QueryOptionsService } from '../../services/query-filter.service';
import { combineLatest, BehaviorSubject, forkJoin } from 'rxjs';
import { pluck, switchMap, map, startWith, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { cache, combineDataset } from '../../operators';

@Component({
    selector: 'app-profesionales-stats-view',
    templateUrl: './profesionales-stats.view.html'
})
export class AppProfesionalesStatsView {
    public loading = false;

    public concept$;
    public profesionales$;
    public data$;

    constructor(
        private snomed: SnomedAPI,
        private qf: QueryOptionsService,
        private activeRoute: ActivatedRoute
    ) {
        this.concept$ = getConceptOperator(this.activeRoute).pipe(
            switchMap(([conceptId, language]) => this.snomed.concept(conceptId, language)),
            cache()
        )


        this.profesionales$ = combineLatest(
            this.concept$,
            this.qf.filstrosParams$.pipe(startWith({}))
        ).pipe(
            tap(() => this.loading = true),
            map(([concept, _]) => concept),
            switchMap((concept: any) => {
                return forkJoin(
                    this.snomed.analytics(concept.conceptId, 'count', 'profesional'),
                    this.snomed.analytics(concept.conceptId, 'unique', 'profesional')
                )
            }),
            map(([dataA, dataB]) => {
                return combineDataset(dataA, dataB, (valueA, valueB) => {
                    valueA.pacientes = valueB;
                    return { ...valueA };
                }).map((item: any) => {
                    return {
                        _id: item._id.profesional || 'SIN NOMBRE',
                        label: item.label.profesional || 'SIN NOMBRE',
                        ...item.value
                    }
                })
            }),
            tap(() => this.loading = false),
        );
    }
}
