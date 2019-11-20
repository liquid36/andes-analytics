import { Component, Input, OnInit } from '@angular/core';
import { SnomedAPI } from '../../services/snomed.service';
import { QueryOptionsService } from '../../services/query-filter.service';
import { debounceTime, distinctUntilChanged, tap, switchMap, catchError } from 'rxjs/operators';
import { Observable, of, Subject, concat } from 'rxjs';
import * as moment from 'moment';

@Component({
    selector: 'app-query-options',
    templateUrl: './app-query-options.component.html',
    styleUrls: ['./app-query-options.component.scss']
})
export class AppQueryOptionsComponent {
    public selected;

    organizations$: Observable<any[]>;
    orgInput$ = new Subject<string>();
    selectedOrganizations: any[] = [];

    ranges: any = {
        'Today': [moment(), moment()],
        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    }

    constructor(
        private snomed: SnomedAPI,
        public qf: QueryOptionsService
    ) {
        this.organizations$ = concat(
            of([]), // default items
            this.orgInput$.pipe(
                debounceTime(200),
                distinctUntilChanged(),
                switchMap(term => this.snomed.organizaciones(term).pipe(
                    catchError(() => of([])),
                ))
            )
        );
    }

    trackByFn(item: any) {
        return item.id;
    }

    datesUpdated($event) {
        const { endDate, startDate } = $event;
        this.qf.set('start', startDate ? startDate.toDate() : null);
        this.qf.set('end', endDate ? endDate.toDate() : null);
    }

    onStartDate(event) {
        const date = new Date(event.year, event.month - 1, event.day);
        this.qf.set('start', date);
    }

    onEndDate(event) {
        const date = new Date(event.year, event.month - 1, event.day);
        this.qf.set('end', date);
    }

    onOrgSelect($event) {
        this.qf.set('organizacion', $event);
    }

    setRelationshipMode(type) {
    }


}
