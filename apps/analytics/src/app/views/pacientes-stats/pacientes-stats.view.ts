import { Component, ViewChild, DebugElement } from '@angular/core';
import { SnomedAPI } from '../../services/snomed.service';
import { QueryOptionsService } from '../../services/query-filter.service';
import { combineLatest, BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { pluck, switchMap, map, startWith, tap, take } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { cache, combineDataset } from '../../operators';

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
        boxplot: { width: 320 * 4, height: 240 * 4 },
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

    onClick($event) {
        const { sexo, key } = $event;

        combineLatest(
            this.concept$,
            this.rango$
        ).pipe(
            switchMap(([concepto, rango]) => {
                return this.snomed.analytics(concepto.conceptId, 'raw', null, {
                    [rango]: key !== -1 ? key : undefined,
                    sexo
                })
            }),
            map((data) => {
                return data.value.filter(item => item.valor).map(item => item.valor);
            }),
            take(1)
        ).subscribe((data) => {
            this.boxplot = { y: data.sort(), type: 'box' };
        });
    }

    boxplot;

}
