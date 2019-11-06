import { Component } from '@angular/core';
import { SnomedAPI } from '../../services/snomed.service';
import { QueryOptionsService } from '../../services/query-filter.service';
import { combineLatest, forkJoin, BehaviorSubject } from 'rxjs';
import { pluck, switchMap, map, startWith, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { cache, combineDataset } from '../../operators';

@Component({
    selector: 'app-conceptos-asociados-stats-view',
    templateUrl: './conceptos-asociados-stats.view.html'
})
export class AppConceptosAsociadosStatsView {
    public loading = false;
    public concept$;
    public asociados$;
    public data$;

    public semanticTags = {
        trastorno: ['trastorno'],
        hallazgo: ['hallazgo', 'evento', 'situación'],
        procedimiento: ['procedimiento', 'régimen/tratamiento', 'entidad observable'],
        producto: ['producto', 'objeto físico', 'medicamento clínico']
    };
    public semanticCluster = new BehaviorSubject<string>('trastorno');
    public semanticCluster$ = this.semanticCluster.asObservable();

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
        );

        this.asociados$ = combineLatest(
            this.concept$,
            this.semanticCluster$,
            this.qf.filstrosParams$.pipe(startWith({}))
        ).pipe(
            tap(() => this.loading = true),
            switchMap(([concept, semantics, _]: [any, any, any]) => {
                return this.snomed.cluster(concept.conceptId, this.semanticTags[semantics]);
            }),
            tap(() => this.loading = false),
        );
    }
}
