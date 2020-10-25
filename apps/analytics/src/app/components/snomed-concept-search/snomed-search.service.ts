
import { Injectable } from '@angular/core';
import { SnomedAPI } from '../../services/snomed.service';
import { Subject, Observable, of } from 'rxjs';
import { mergeObject, distincObject, cache } from '../../operators';
import { tap, filter, switchMap, pluck, map, startWith } from 'rxjs/operators';
import { DescriptionParams } from '@andes-analytics/snomed';
import { ActivatedRoute } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class SnomedSearchService {
    public searchParams = new Subject<any>();
    public searchParams$ = this.searchParams.asObservable();

    public searchResult$: Observable<any>;

    language = 'es';

    constructor(
        private snomed: SnomedAPI,
        private route: ActivatedRoute
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
            startWith({ items: [], semanticTags: {} }),
            cache()
        );

        this.route.queryParamMap.subscribe(params => {
            this.language = params.get('language');
        })

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
            language: this.language
        };
        if (query.semanticTag && query.semanticTag.length > 0) {
            params.semanticTag = query.semanticTag;
        }
        return this.snomed.descriptions(params);
    }
}
