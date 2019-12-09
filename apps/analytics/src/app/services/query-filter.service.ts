
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { mergeObject, distincObject } from '../operators';
import { pluck, tap } from 'rxjs/operators';
import { SnomedHTTP } from '../../../../../libs/snomed/src/lib/services/snomed.http';
import { Router, ActivatedRoute } from '@angular/router';

type IFILTER = 'start' | 'end' | 'organizacion' | 'profesional' | 'relationship' | 'sexo' | 'prestacion' | 'localidad';

@Injectable({
    providedIn: 'root',
})
export class QueryOptionsService {
    public INFERRED = '900000000000011006';
    public STATED = '900000000000010007';

    public data: object = {};
    public filstrosParams = new Subject<any>();
    public filstrosParams$: Observable<any>;

    private conceptSelected = new BehaviorSubject<any>(null);
    private conceptSelected$ = this.conceptSelected.asObservable();

    constructor(
        private snomed: SnomedHTTP,
        private router: Router,
        private activeRoute: ActivatedRoute
    ) {
        this.filstrosParams$ = this.filstrosParams.asObservable().pipe(
            mergeObject(),
            distincObject(),
            tap((dto: any) => this.data = dto)
        );
    }

    public set(name: IFILTER, value: any) {
        this.filstrosParams.next({ [name]: value });
    }

    public setAll(values: any) {
        const filtrosKey = ['prestacion', 'organizacion', 'profesional', 'localidad', 'sexo'];
        filtrosKey.forEach((key) => {
            if (!values[key]) {
                values[key] = null;
            }
        });
        this.filstrosParams.next(values);
    }

    public getFilter(name: IFILTER) {
        return this.filstrosParams$.pipe(pluck(name));
    }

    public getValue(name: IFILTER) {
        return this.data[name];
    }

    selectConcept(conceptId: string) {
        this.router.navigate(['concept', conceptId, 'detail'], { queryParamsHandling: 'preserve' });
    }

    onConcept() {
        return this.conceptSelected$;
    }

}
