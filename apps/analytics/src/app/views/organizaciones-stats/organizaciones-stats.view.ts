import { Component } from '@angular/core';
import { SnomedAPI } from '../../services/snomed.service';
import { QueryOptionsService } from '../../services/query-filter.service';
import { combineLatest, BehaviorSubject, forkJoin } from 'rxjs';
import { pluck, switchMap, map, merge, startWith } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { cache, combineDataset } from '../../operators';

@Component({
    selector: 'app-organizaciones-stats-view',
    templateUrl: './organizaciones-stats.view.html'
})
export class AppOrganizacionesStatsView {
    public concept$;
    public organizaciones$;
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


        this.organizaciones$ = combineLatest(
            this.concept$,
            this.qf.filstrosParams$.pipe(startWith({}))
        ).pipe(
            map(([concept, _]) => concept),
            switchMap((concept: any) => {
                return forkJoin(
                    this.snomed.analytics(concept.conceptId, 'count', 'organizacion'),
                    this.snomed.analytics(concept.conceptId, 'unique', 'organizacion')
                )
            }),
            map(([dataA, dataB]) => {
                return combineDataset(dataA, dataB, (valueA, valueB) => {
                    valueA.pacientes = valueB;
                    return { ...valueA };
                }).map((item: any) => {
                    return {
                        _id: item._id.organizacion || 'SIN NOMBRE',
                        label: item.label.organizacion || 'SIN NOMBRE',
                        ...item.value
                    }
                })
            })
        );
    }
}
