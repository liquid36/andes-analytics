import { Component } from '@angular/core';
import { SnomedSearchService } from './snomed-search.service';
import { KeyValue } from '@angular/common';
import { QueryOptionsService } from '../../services/query-filter.service';
import { AppService } from '../../services/app.service';

@Component({
    selector: 'snomed-search',
    templateUrl: './snomed-search.component.html',
    styleUrls: ['snomed-search.component.scss']
})
export class SnomedSearchComponent {
    text = '';
    results$ = this.searchService.getResult('items');
    semantics$ = this.searchService.getResult('semanticTag');
    semTagSelected$ = this.searchService.getSearchParams('semanticTag');

    constructor(
        private searchService: SnomedSearchService,
        private qf: QueryOptionsService,
        public appService: AppService
    ) {

    }

    valueAscOrder = (a: KeyValue<string, number>, b: KeyValue<string, number>): number => {
        return b.value - a.value;
    }

    onChange(text) {
        this.searchService.search({ search: text });
    }

    onSemtagClick(semTag) {
        this.searchService.search({ semanticTag: semTag });
    }

    removeSemTag() {
        this.searchService.search({ semanticTag: null });
    }

    onClick(concept) {
        this.qf.selectConcept(concept.conceptId);
    }

    toogleNavbar() {
        this.appService.tootleNavbarState();
    }

}
