import { Component, Input, OnInit } from '@angular/core';
import { SnomedAPI } from '../../services/snomed.service';
import { QueryOptionsService } from '../../services/query-filter.service';
import { debounceTime, distinctUntilChanged, tap, switchMap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
    selector: 'app-query-options',
    templateUrl: './app-query-options.component.html',
    styleUrls: ['./app-query-options.component.scss']
})
export class AppQueryOptionsComponent {

    constructor(
        private snomed: SnomedAPI,
        public qf: QueryOptionsService
    ) {

    }
    searching = false;
    searchFailed = false;

    onStartDate(event) {
        const date = new Date(event.year, event.month - 1, event.day);
        this.qf.set('start', date);
    }

    onEndDate(event) {
        const date = new Date(event.year, event.month - 1, event.day);
        this.qf.set('end', date);
    }

    formatter = (x) => x.nombre;
    search = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => this.searching = true),
            switchMap(term =>
                this.snomed.organizaciones(term).pipe(
                    tap(() => this.searchFailed = false),
                    catchError(() => {
                        this.searchFailed = true;
                        return of([]);
                    }))
            ),
            tap(() => this.searching = false)
        )

    onOrgSelect($event) {
        this.qf.set('organizacion', $event.item);
    }

    setRelationshipMode(type) {
    }


}
