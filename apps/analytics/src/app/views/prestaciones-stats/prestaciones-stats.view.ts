import { Component } from '@angular/core';
import { SnomedAPI } from '../../services/snomed.service';
import { QueryOptionsService } from '../../services/query-filter.service';
import { combineLatest, BehaviorSubject, forkJoin } from 'rxjs';
import { pluck, switchMap, map, merge, startWith, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { cache, combineDataset } from '../../operators';

@Component({
    selector: 'app-prestaciones-stats-view',
    templateUrl: './prestaciones-stats.view.html'
})
export class AppPrestacionesStatsView {
    public loading = false;

    public concept$;
    public prestaciones$;
    public data$;

    constructor(
        private snomed: SnomedAPI,
        private qf: QueryOptionsService,
        private activeRoute: ActivatedRoute
    ) {
        this.concept$ = this.activeRoute.paramMap.pipe(
            map((dto: any) => dto.params),
            pluck('id'),
            switchMap((conceptId) => this.snomed.concept(conceptId)),
            cache()
        )


        this.prestaciones$ = combineLatest(
            this.concept$,
            this.qf.filstrosParams$.pipe(startWith({}))
        ).pipe(
            tap(() => this.loading = true),
            map(([concept, _]) => concept),
            switchMap((concept: any) => {
                return forkJoin(
                    this.snomed.analytics(concept.conceptId, 'count', 'prestacion'),
                    this.snomed.analytics(concept.conceptId, 'unique', 'prestacion')
                )
            }),
            map(([dataA, dataB]) => {
                return combineDataset(dataA, dataB, (valueA, valueB) => {
                    valueA.pacientes = valueB;
                    return { ...valueA };
                }).map((item: any) => {
                    return {
                        _id: item._id.prestacion || 'SIN NOMBRE',
                        label: item.label.prestacion || 'SIN NOMBRE',
                        ...item.value
                    }
                })
            }),
            tap(() => this.loading = false),
        );
    }
}
