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

    filtrosSelect$: Observable<any[]>;
    typeahead$ = new Subject<string>();
    selectedOrganizations: any[] = [];

    ranges: any = {
        'Este mes': [
            moment().startOf('month'),
            moment().endOf('month')
        ],
        'Mes pasado': [
            moment().subtract(1, 'month').startOf('month'),
            moment().subtract(1, 'month').endOf('month')
        ],
        'Ultimos 6 meses': [
            moment().subtract(6, 'month'),
            moment().endOf('month')
        ],
        'Este año': [
            moment().startOf('year'),
            moment().endOf('year')
        ],
        'Año pasado': [
            moment().subtract(1, 'year').startOf('year'),
            moment().subtract(1, 'year').endOf('year')
        ]
    }

    constructor(
        private snomed: SnomedAPI,
        public qf: QueryOptionsService
    ) {
        this.filtrosSelect$ = concat(
            of([]), // default items
            this.typeahead$.pipe(
                debounceTime(200),
                distinctUntilChanged(),
                switchMap(term => {
                    const type = this.filtrosRestantes();
                    const params = { search: term, type };
                    return this.snomed.filtros(params).pipe(
                        catchError(() => of([]))
                    )
                })
            )
        );
    }

    filtrosRestantes() {
        const types = {
            'prestacion': true, 'organizacion': true, 'profesional': true, 'localidad': true, 'sexo': true
        };
        this.selectedOrganizations.forEach(data => types[data.type] = false);
        return Object.keys(types).filter(key => types[key]).join(',');

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

    onFiltrosChange($event) {
        const types = {};
        $event.forEach(data => types[data.type] = data);
        this.qf.setAll(types);
    }

    setRelationshipMode(type) {
    }


}
