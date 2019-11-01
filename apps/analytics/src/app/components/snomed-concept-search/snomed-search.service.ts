
import { Injectable } from '@angular/core';
import { SnomedAPI } from '../../services/snomed.service';
import { Subject, Observable } from 'rxjs';
import { mergeObject, distincObject, cache } from '../../operators';
import { tap, filter, switchMap, pluck, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class SnomedSearchService {
    public searchParams = new Subject<any>();
    public searchParams$ = this.searchParams.asObservable();

    public searchResult$: Observable<any>;
    // public filterResult$: Observable<any[]>;

    constructor(
        private snomed: SnomedAPI
    ) {
        this.searchResult$ = this.searchParams$.pipe(
            mergeObject(),
            distincObject(),
            // tap(params => {
            //     this.router.navigate([], {
            //         queryParams: params, queryParamsHandling: 'merge'
            //     });
            // }),
            // filter((params: any) => params.mode && params.search && params.status),
            switchMap((params) => {
                return this.searchRequest(params);
            }),
            map((result) => {
                return {
                    items: result.matches,
                    semanticTag: result.filters.semTag
                }
            }),
            cache()
        );


    }

    public getSearchParams(name) {
        return this.searchParams$.pipe(pluck(name));
    }

    public getResult(name: 'items' | 'semanticTag') {
        return this.searchResult$.pipe(pluck(name));
    }

    public search(query) {
        this.searchParams.next(query);
    }

    private searchRequest(query) {
        const params: any = {
            query: query.search,
            limit: 20,
            searchMode: 'partialMatching',
            lang: 'english',
            statusFilter: 'activeOnly',
            skipTo: 0,
            returnLimit: 50,
            normalize: true
        };
        if (query.semanticTag && query.semanticTag.length > 0) {
            params.semanticFilter = query.semanticTag;
        }
        return this.snomed.descriptions(params);
    }
}
