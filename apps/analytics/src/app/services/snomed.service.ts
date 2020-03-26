
import { Injectable } from '@angular/core';
import { map, bufferTime, filter, switchMap } from 'rxjs/operators';
import { of, BehaviorSubject } from 'rxjs';
import { QueryOptionsService } from './query-filter.service';
import { SnomedHTTP, DescriptionParams } from '@andes-analytics/snomed';
import { cache } from '../operators';

type VISULIZATION = 'unique' | 'count' | 'value' | 'raw';

@Injectable({
    providedIn: 'root',
})
export class SnomedAPI {
    constructor(
        private api: SnomedHTTP,
        private qf: QueryOptionsService
    ) {

        this.qf.filstrosParams$.subscribe(() => {
            this.conceptBS = {};
        });

        this.fromStats$.pipe(
            filter(concepts => concepts),
            bufferTime(250),
            filter(concepts => concepts.length > 0),
            switchMap(concepts => {
                return this.history(concepts);
            })
        ).subscribe(() => { });

    }

    private cache = {};
    private conceptBS = {};


    public fromStats = new BehaviorSubject(null);
    public fromStats$ = this.fromStats.asObservable();

    descriptions(params: DescriptionParams) {
        return this.api.descriptions(params);
    }

    concept(sctid) {
        return this.api.concept(sctid);
    }

    parents(sctid) {
        const form = this.qf.getValue('relationship') || 'inferred';
        return this.api.parents(sctid, { form });
    }

    children(sctid) {
        const form = this.qf.getValue('relationship') || 'inferred';
        return this.api.children(sctid, { form });
    }

    stats(id) {
        if (!this.conceptBS[id]) {
            this.conceptBS[id] = new BehaviorSubject({ total: 0, exact: 0, children: 0 });
            this.fromStats.next(id);
        }
        return this.conceptBS[id];
    }

    getParams() {
        // [TODO] Filtros hardcoreados
        const start = this.qf.getValue('start');
        const end = this.qf.getValue('end');
        const organizacion = this.qf.getValue('organizacion') ? this.qf.getValue('organizacion').key : null;
        const profesional = this.qf.getValue('profesional') ? this.qf.getValue('profesional').key : null;
        const prestacion = this.qf.getValue('prestacion') ? this.qf.getValue('prestacion').key : null;
        const sexo = this.qf.getValue('sexo') ? this.qf.getValue('sexo').key : null;
        const localidad = this.qf.getValue('localidad') ? this.qf.getValue('localidad').key : null;
        const type = this.qf.getValue('relationship') || 'inferred';
        return { start, end, organizacion, type, sexo, localidad, profesional, prestacion };
    }

    history(sctids: string[]) {
        const filter = this.getParams();

        const reals = sctids.filter(c => !this.cache[c]);
        const body = {
            visualization: 'count',
            target: reals,
            filter
        };

        if (reals.length > 0) {
            return this.api.analytics(body).pipe(map(data => {
                const res = {};
                sctids.forEach(c => {
                    const value = data[c].value;
                    if (this.conceptBS[c]) {
                        this.conceptBS[c].next(value);
                    } else {
                        this.conceptBS[c] = new BehaviorSubject(value);
                    }
                    if (this.cache[c]) {
                        res[c] = this.cache[c];
                    } else {
                        res[c] = value;
                    }
                });
                return res;
            }));
        } else {
            const res = {};
            sctids.forEach(c => {
                res[c] = this.cache[c];
            });
            return of(res);
        }
    }

    demografia(type: VISULIZATION, sctid, rangoEtario) {
        const filter = this.getParams();

        const body = {
            visualization: type,
            target: sctid,
            filter: {
                ...filter,
                rangoEtario
            },
            group: ['sexo', 'decada']
        };

        return this.api.analytics(body).pipe(map(data => data[sctid]));
    }

    analytics(sctid, visualization: VISULIZATION, group = null) {
        const filter = this.getParams();
        const body = {
            visualization,
            target: sctid,
            filter,
            group
        }
        return this.api.analytics(body).pipe(map(data => data[sctid]));
    }

    cluster(sctid, semanticTags) {
        return this.api.cluster(sctid, semanticTags);
    }

    maps(sctid) {
        return this.api.maps(sctid);
    }

    terms(sctid) {
        const start = this.qf.getValue('start');
        const end = this.qf.getValue('end');
        const organizacion = this.qf.getValue('organizacion') ? this.qf.getValue('organizacion').key : null;
        return this.api.terms(sctid, {
            start,
            end,
            organizacion
        });
    }

    organizaciones(search) {
        return this.api.organizaciones({ search });
    }

    filtros(params) {
        return this.api.filtros(params);
    }

    organizaciones2() {
        return this.api.organizaciones2();
    }

    public conceptosNumericos$ = this.api.conceptosNumerticos().pipe(
        cache()
    )

}
