import { Component, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { SnomedAPI } from '../../services/snomed.service';
import { QueryOptionsService } from '../../services/query-filter.service';
import { combineLatest, BehaviorSubject, forkJoin } from 'rxjs';
import { pluck, switchMap, map, merge, startWith, tap, switchAll } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { cache, combineDataset } from '../../operators';
import { Location } from '@angular/common';

@Component({
    selector: 'app-sanddance-view',
    templateUrl: './sanddance-view.view.html',
    styleUrls: ['./sanddance-view.view.scss']
})
export class AppSandDanceView implements AfterViewInit {
    @ViewChild('frame', { static: false }) element;

    public loading = false;

    public concept$;
    public prestaciones$;
    public data$;

    constructor(
        private snomed: SnomedAPI,
        private activeRoute: ActivatedRoute,
        private changeDetector: ChangeDetectorRef,
        private location: Location
    ) {
        this.concept$ = this.activeRoute.paramMap.pipe(
            map((dto: any) => dto.params),
            pluck('id'),
            switchMap((conceptId) => this.snomed.concept(conceptId)),
            cache(),
        );


    }

    cerrar() {
        this.location.back();
    }

    ngAfterViewInit() {
        this.concept$.pipe(
            switchMap((c: any) => {
                return this.snomed.analytics(c.conceptId, 'raw', 'organizacion')
            }),
            map((data: any) => {
                return data.map((item) => {
                    item.value.concepto = item.value.concepto.substring(0, 40).replace(/\ /g, '_');
                    item.value.profesionalNombre = item.value.profesionalNombre.replace(/\ /g, '_');
                    item.value.organizacionNombre = item.value.organizacionNombre.replace(/\ /g, '_');
                    item.value.tipoPrestacion = item.value.tipoPrestacion.replace(/\ /g, '_');
                    return item.value;
                })
            })
        ).subscribe((m) => {
            setTimeout(() => {
                this.changeDetector.detectChanges();
                this.element.nativeElement.contentWindow.postMessage(m, '*');
            }, 500)
        })

    }
}
