
import { DescriptionParams, SnomedHTTP } from '@andes-analytics/snomed';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { bufferTime, filter, map, pluck, switchMap } from 'rxjs/operators';
import { cache } from '../operators';
import { QueryOptionsService } from './query-filter.service';

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

    concept(sctid, language = 'es') {
        return this.api.concept(sctid, { language });
    }

    parents(sctid) {
        const form = this.qf.getValue('relationship') || 'inferred';
        return this.api.parents(sctid, { form });
    }

    children(sctid, language = 'es') {
        const form = this.qf.getValue('relationship') || 'inferred';
        return this.api.children(sctid, { form, language });
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
        const ambito = this.qf.getValue('ambito') ? this.qf.getValue('ambito').key : null;
        const turno = this.qf.getValue('turno') ? this.qf.getValue('turno').key : null;
        const type = this.qf.getValue('relationship') || 'inferred';
        return { start, end, organizacion, type, sexo, localidad, profesional, prestacion, ambito, turno };
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
                ...filter
            },
            group: ['sexo', rangoEtario]
        };

        return this.api.analytics(body).pipe(map(data => data[sctid]));
    }

    analytics(sctid, visualization: VISULIZATION, group = null, filters = {}, project = null) {
        const filter = { ...this.getParams(), ...filters };
        const body = {
            visualization,
            target: sctid,
            filter,
            group,
            project
        }
        return this.api.analytics(body).pipe(map(data => data[sctid]));
    }

    cluster(sctid, semanticTags, asociacion: string) {
        return this.api.cluster(sctid, semanticTags, asociacion);
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

    filtros(params) {
        return this.api.filtros(params);
    }

    organizaciones() {
        return this.api.organizaciones();
    }

    public conceptosNumericos$ = this.api.conceptosNumerticos().pipe(
        cache()
    )

}

export function getConceptOperator(activeRoute: ActivatedRoute): Observable<[string, string]> {
    return combineLatest(
        activeRoute.paramMap.pipe(
            map((dto: any) => dto.params),
            pluck('id')
        ),
        activeRoute.queryParams.pipe(
            pluck('language'),
        )
    ) as any
}