
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { mergeObject, distincObject } from '../operators';
import { pluck, tap } from 'rxjs/operators';
import { SnomedHTTP } from './snomed.http';

type IFILTER = 'start' | 'end' | 'organizacion' | 'profesional' | 'relationship';

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

    constructor(private snomed: SnomedHTTP) {
        this.filstrosParams$ = this.filstrosParams.asObservable().pipe(
            mergeObject(),
            distincObject(),
            tap((dto: any) => this.data = dto)
        );
    }

    public set(name: IFILTER, value: any) {
        this.filstrosParams.next({ [name]: value });
    }

    public getFilter(name: IFILTER) {
        return this.filstrosParams$.pipe(pluck(name));
    }

    public getValue(name: IFILTER) {
        return this.data[name];
    }

    selectConcept(conceptId: string) {
        if (conceptId) {
            this.snomed.concept(conceptId).subscribe((snomed) => {
                this.conceptSelected.next(snomed);
            });
        }
    }

    onConcept() {
        return this.conceptSelected$;
    }

}
