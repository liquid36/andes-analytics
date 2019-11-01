
import { Injectable } from '@angular/core';
import { Server } from './server.service';
import { map, tap, bufferTime, filter, switchMap } from 'rxjs/operators';
import { of, BehaviorSubject } from 'rxjs';
import { QueryOptionsService } from './query-filter.service';
import { environment } from '../../environments/environment';
import { SnomedHTTP } from './snomed.http';

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

    descriptions(params) {
        return this.api.descriptions(params);
    }

    concept(sctid) {
        return this.api.concept(sctid);
    }

    concepts(sctids) {
        return this.api.concepts(sctids);
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

    history(sctids: string[]) {
        const start = this.qf.getValue('start');
        const end = this.qf.getValue('end');
        const organizacion = this.qf.getValue('organizacion') ? this.qf.getValue('organizacion').id : null;
        const form = this.qf.getValue('relationship') || 'inferred';

        const reals = sctids.filter(c => !this.cache[c]);
        const body = {
            visualization: 'count',
            target: reals,
            type: form,
            filter: {
                start,
                end,
                organizacion
            }
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

    demografia(sctid, rangoEtario) {
        const start = this.qf.getValue('start');
        const end = this.qf.getValue('end');
        const organizacion = this.qf.getValue('organizacion') ? this.qf.getValue('organizacion').id : null;

        return this.api.demografia({ conceptId: sctid, rango: rangoEtario, start, end, organizacion });
    }

    cluster(sctid, semanticTags) {
        const start = this.qf.getValue('start');
        const end = this.qf.getValue('end');
        const organizacion = this.qf.getValue('organizacion') ? this.qf.getValue('organizacion').id : null;

        return this.api.cluster(sctid, semanticTags);
    }

    maps(sctid) {
        const start = this.qf.getValue('start');
        const end = this.qf.getValue('end');
        const organizacion = this.qf.getValue('organizacion') ? this.qf.getValue('organizacion').id : null;

        return this.api.maps(sctid);
    }

    terms(sctid) {
        const start = this.qf.getValue('start');
        const end = this.qf.getValue('end');
        const organizacion = this.qf.getValue('organizacion') ? this.qf.getValue('organizacion').id : null;
        return this.api.terms(sctid, {
            start,
            end,
            organizacion
        });
    }

    organizaciones(search) {
        return this.api.organizaciones({ search });
    }

    semanticTags(search) {
        return this.api.semanticTags({ search });
    }
}
