import { Component } from '@angular/core';
import { SnomedAPI } from '../../services/snomed.service';
import { QueryOptionsService } from '../../services/query-filter.service';
import { combineLatest, BehaviorSubject, forkJoin, Observable, Subject } from 'rxjs';
import { pluck, switchMap, map, startWith, tap, take, publishReplay, refCount, takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { cache } from '../../operators';

@Component({
    selector: 'app-pacientes-stats-view',
    templateUrl: './pacientes-stats.view.html'
})
export class AppPacientesStatsView {
    public loading = false;

    public rango = new BehaviorSubject('nacional');
    public rango$ = this.rango.asObservable();

    public metrica = new BehaviorSubject('count');
    public metrica$ = this.metrica.asObservable();

    public concept$: Observable<any>;
    public data$;
    public masculinoBarChart$;
    public femeninoBarChart$;


    public demografiaCache;


    public graph = {
        layout: { width: 320 * 3, height: 240 * 2, barmode: 'overlay' },
        boxplot: { width: window.innerWidth * 0.8, height: window.innerHeight * 0.8 },
    };



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
                return this.snomed.demografia(metrica as any, concept.conceptId, rango)
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

        this.masculinoBarChart$ = combineLatest(this.data$, this.rango$).pipe(
            map(([data, key]: [any[], string]) => {
                data = data.filter((item) => item._id.sexo === 'masculino').sort((a, b) => a._id[key] - b._id[key]).map(item => {
                    return { value: item.value.total, key: item._id[key] }
                });
                const _key = data.map(elem => '_' + elem.key);
                const _values = data.map(elem => -elem.value);
                return { x: _values, y: _key, type: 'bar', orientation: 'h', name: 'Masculino' };
            })
        );

        this.femeninoBarChart$ = combineLatest(this.data$, this.rango$).pipe(
            map(([data, key]: [any[], string]) => {
                data = data.filter((item) => item._id.sexo === 'femenino').sort((a, b) => a._id[key] - b._id[key]).map(item => {
                    return { value: item.value.total, key: item._id[key] }
                });
                const _key = data.map(elem => '_' + elem.key);
                const _values = data.map(elem => elem.value);
                return { x: _values, y: _key, type: 'bar', orientation: 'h', name: 'Femenino' };
            })
        );
    }

    changeRangoEtario(rango) {
        this.rango.next(rango);
    }

    setMetrica(metrica) {
        this.metrica.next(metrica);
    }


    dataRaw$: Observable<any>;
    conceptos$: Observable<any>;
    boxplotData$: Observable<any>;
    takeUntil$ = new Subject();
    conceptosSelected = new BehaviorSubject<any>({});

    conceptos: any[];
    onClick($event) {
        const { sexo, key } = $event;
        this.dataRaw$ = combineLatest(
            this.concept$,
            this.rango$
        ).pipe(
            switchMap(([concepto, rango]) => {
                return this.snomed.analytics(concepto.conceptId, 'raw', null, {
                    [rango]: key !== -1 ? key : undefined,
                    sexo
                })
            }),
            publishReplay(1),
            refCount(),
            takeUntil(this.takeUntil$)
        );

        this.conceptos$ = this.dataRaw$.pipe(
            map((data) => {
                return [
                    ...data.value.reduce(
                        (acc: Set<string>, curr) => {
                            acc.add(curr.concepto);
                            return acc
                        },
                        new Set()
                    )
                ]
            }),
            tap((conceptos: string[]) => {
                const c = {};
                conceptos.forEach((s) => c[s] = true);
                this.conceptosSelected.next(c);
            })
        );

        this.boxplotData$ = combineLatest(
            this.dataRaw$,
            this.conceptosSelected
        ).pipe(
            map(([data, conceptos]) => {
                return data.value.filter(item => item.valor && conceptos[item.concepto]).map(item => item.valor);
            }),
            map((data) => {
                return [{ y: data.sort(), type: 'box' }];
            })
        );

    }

    onCloseFullscreen() {
        this.takeUntil$.next()
        this.takeUntil$.complete();
        this.boxplotData$ = null;
        this.conceptos$ = null;
        this.dataRaw$ = null;
    }

    onItemClick(c: string) {
        const selecteds = this.conceptosSelected.getValue();
        selecteds[c] = !selecteds[c];
        this.conceptosSelected.next(selecteds);
    }

}
