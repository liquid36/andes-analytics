
import { Injectable } from '@angular/core';
import { SnomedAPI } from '../../services/snomed.service';
import { Subject, Observable, of } from 'rxjs';
import { mergeObject, distincObject, cache } from '../../operators';
import { tap, filter, switchMap, pluck, map } from 'rxjs/operators';
import { DescriptionParams } from '@andes-analytics/snomed';

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
            switchMap((params: any) => {
                if (params.search && params.search.length > 0) {
                    return this.searchRequest(params);
                } else {
                    return of({ items: [], buckets: { semanticTags: {} } })
                }
            }),
            map(result => {
                return {
                    items: result.items,
                    semanticTags: result.buckets.semanticTags
                }
            }),
            cache()
        );


    }

    public getSearchParams(name) {
        return this.searchParams$.pipe(pluck(name));
    }

    public getResult(name: 'items' | 'semanticTags') {
        return this.searchResult$.pipe(pluck(name));
    }

    public search(query) {
        this.searchParams.next(query);
    }

    private searchRequest(query) {
        const params: DescriptionParams = {
            term: query.search,
            limit: 20,
        };
        if (query.semanticTag && query.semanticTag.length > 0) {
            params.semanticTag = query.semanticTag;
        }
        return this.snomed.descriptions(params);
    }
}
