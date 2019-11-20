import { Component, ViewChild, DebugElement } from '@angular/core';
import { SnomedAPI } from '../../services/snomed.service';
import { QueryOptionsService } from '../../services/query-filter.service';
import { combineLatest, BehaviorSubject, forkJoin } from 'rxjs';
import { pluck, switchMap, map, startWith, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { cache, combineDataset } from '../../operators';

@Component({
    selector: 'app-pacientes-stats-view',
    templateUrl: './pacientes-stats.view.html'
})
export class AppPacientesStatsView {
    public loading = false;

    public nacional = [0, 1, 2, 6, 10, 15, 50];
    public provincial = [0, 1, 5, 15, 20, 40, 70];

    public rango = new BehaviorSubject(this.nacional);
    public rango$ = this.rango.asObservable();

    public metrica = new BehaviorSubject('count');
    public metrica$ = this.metrica.asObservable();

    public concept$;
    public localidades$;
    public data$;


    public demografiaCache;

    constructor(
        private snomed: SnomedAPI,
        private qf: QueryOptionsService,
        private activeRoute: ActivatedRoute
    ) {
        this.concept$ = this.activeRoute.paramMap.pipe(
            map((dto: any) => dto.params),
            pluck('id'),
            switchMap((conceptId) => {
                return forkJoin(
                    this.snomed.concept(conceptId),
                    this.snomed.conceptosNumericos$
                );
            }),
            map(([concept, numericos]: [any, any[]]) => {
                const isNumerico = numericos.find(item => item.conceptId === concept.conceptId);
                concept.isNumeric = isNumerico;
                return concept;
            }),
            cache()
        )

        this.data$ = combineLatest(
            this.concept$,
            this.rango$,
            this.metrica$,
            this.qf.filstrosParams$.pipe(startWith({}))
        ).pipe(
            switchMap(([concept, rango, metrica]) => {
                return this.snomed.demografia(metrica as any, (concept as any).conceptId, rango)
            }),
            map(list => {
                this.demografiaCache = list;
                return list.map(item => {
                    if (!item.value.total) {
                        item.value = { total: item.value };
                    }
                    return item;
                })
            }),
            cache()
        )


        this.localidades$ = combineLatest(
            this.concept$,
            this.qf.filstrosParams$.pipe(startWith({}))
        ).pipe(
            tap(() => this.loading = true),
            map(([concept, _]) => concept),
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
            }),
            tap(() => this.loading = false),
        );
    }

    changeRangoEtario(rango) {
        this.rango.next(rango);
    }

    setMetrica(metrica) {
        this.metrica.next(metrica);
    }

    // @ViewChild('frame', { static: false }) element;
    // verSandDance() {
    //     setTimeout(() => {
    //         debugger
    //         const m = this.demografiaCache.map(i => {
    //             return {
    //                 sexo: i._id.sexo,
    //                 decada: i._id.decada,
    //                 total: i.value.total,
    //                 exact: i.value.exact
    //             }
    //         });
    //         this.element.nativeElement.contentWindow.postMessage(m, '*');
    //     }, 500)
    // }
}