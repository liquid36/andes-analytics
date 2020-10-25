import { Component } from '@angular/core';
import { SnomedSearchService } from './snomed-search.service';
import { KeyValue } from '@angular/common';
import { QueryOptionsService } from '../../services/query-filter.service';
import { AppService } from '../../services/app.service';
import { IConcept } from '@andes-analytics/snomed';
import { UserService } from '../../services/users.service';
import { Observable } from 'rxjs';
import { cache } from '../../operators';

@Component({
    selector: 'snomed-search',
    templateUrl: './snomed-search.component.html',
    styleUrls: ['snomed-search.component.scss']
})


export class SnomedSearchComponent {
    text = '';
    results$ = this.searchService.getResult('items');
    semantics$ = this.searchService.getResult('semanticTags');
    semTagSelected$ = this.searchService.getSearchParams('semanticTag');
    selectedConcept: string = null;

    public frecuentes$: Observable<any>;

    constructor(
        private searchService: SnomedSearchService,
        private qf: QueryOptionsService,
        public appService: AppService,
        private userService: UserService
    ) {

        this.frecuentes$ = this.userService.misFrecuentes().pipe(
            cache()
        )

    }

    valueAscOrder = (a: KeyValue<string, number>, b: KeyValue<string, number>): number => {
        return b.value - a.value;
    }

    onChange(text) {
        this.searchService.search({ search: text });
    }

    onSemtagClick(semTag) {
        this.searchService.search({ semanticTag: semTag.key });
    }

    removeSemTag() {
        this.searchService.search({ semanticTag: null });
    }

    onClick(concept: IConcept) {
        this.qf.selectConcept(concept);
        this.selectedConcept = concept.conceptId;
    }

    toogleNavbar() {
        this.appService.tootleNavbarState();
    }

}
