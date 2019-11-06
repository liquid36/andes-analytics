import { Component } from '@angular/core';
import { SnomedAPI } from '../../services/snomed.service';
import { QueryOptionsService } from '../../services/query-filter.service';
import { Observable, Subject, combineLatest, BehaviorSubject, forkJoin } from 'rxjs';
import { tap, pluck, switchAll, switchMap, map, merge } from 'rxjs/operators';
import { ActivationEnd, ActivatedRoute } from '@angular/router';
import { cache, combineDataset } from '../../operators';

@Component({
    selector: 'app-pacientes-stats-view',
    templateUrl: './pacientes-stats.view.html'
})
export class AppPacientesStatsView {
    public nacional = [0, 1, 2, 6, 10, 15, 50];
    public provincial = [0, 1, 5, 15, 20, 40, 70];

    public rango = new BehaviorSubject(this.nacional);
    public rango$ = this.rango.asObservable();

    public concept$;
    public localidades$;
    public data$;


    constructor(
        private snomed: SnomedAPI,
        public qf: QueryOptionsService,
        private activeRoute: ActivatedRoute
    ) {
        this.concept$ = this.activeRoute.paramMap.pipe(
            map((dto: any) => dto.params),
            pluck('id'),
            switchMap((conceptId) => this.snomed.concept(conceptId)),
            cache()
        )

        this.data$ = combineLatest(this.concept$, this.rango$).pipe(
            switchMap(([concept, rango]) => {
                return this.snomed.demografia((concept as any).conceptId, rango)
            }),
            cache()
        )

        this.localidades$ = this.concept$.pipe(
            switchMap((concept: any) => {
                return forkJoin(
                    this.snomed.analytics(concept.conceptId, 'count', 'localidad'),
                    this.snomed.analytics(concept.conceptId, 'unique', 'localidad')
                )
            }),
            map(([dataA, dataB]) => {
                return combineDataset(dataA, dataB, (valueA, valueB) => {
                    valueA.pacientes = valueB;
                    return { ...valueA };
                }).map((item: any) => {
                    return {
                        _id: item._id.localidad || 'SIN LOCALIDAD',
                        label: item.label.localidad || 'SIN LOCALIDAD',
                        ...item.value
                    }
                })
            })
        );
    }

    changeRangoEtario(rango) {
        this.rango.next(rango);
    }

}
