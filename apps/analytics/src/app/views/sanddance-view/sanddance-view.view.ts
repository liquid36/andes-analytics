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

    public cacheData = null;

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
            this.cacheData = m;
            setTimeout(() => {

                this.changeDetector.detectChanges();
                this.element.nativeElement.contentWindow.postMessage({
                    data: m,
                    insight: piramidaPoblacional
                }, '*');
                // setInterval(() => {
                //     this.element.nativeElement.contentWindow.postMessage({
                //         action: 'getInsight'
                //     }, '*');
                // }, 2000)

                // window.addEventListener('message', e => {
                //     if (e.data) {
                //         const data = e.data;
                //         if (data.request.action === 'getInsight') {
                //             console.log(JSON.stringify(data.insight));
                //         }
                //     }
                // });
            }, 500)
        })

    }

    changeInsight(grafico) {
        this.changeDetector.detectChanges();
        this.element.nativeElement.contentWindow.postMessage({
            data: this.cacheData,
            insight: grafico === 'piramide' ? piramidaPoblacional : fechaXedad3D
        }, '*');
    }
}


const piramidaPoblacional = {
    "colorBin": "quantile",
    "columns": {
        "x": "concepto",
        "sort": "edad",
        "color": "edad",
        "size": "edad",
        "z": "edad",
        "y": "edad",
        "facet": "sexo"
    },
    "facets": {
        "columns": 2,
        "rows": 1
    },
    "filter": [
        {
            "key": 0,
            "clause": null,
            "expressions": [
                {
                    "key": 0,
                    "clause": null,
                    "name": "edad",
                    "operator": "<",
                    "value": "100",
                    "unlocked": true,
                    "errorMessage": null
                }
            ]
        }
    ],
    "hideAxes": false,
    "hideLegend": false,
    "scheme": "redyellowgreen",
    "signalValues": {
        "RoleZ_ProportionSignal": 0.6,
        "Text_ScaleSignal": 2,
        "Text_AngleXSignal": 30,
        "Text_AngleYSignal": 0,
        "Mark_OpacitySignal": 1,
        "RoleY_BinsSignal": 20,
        "RoleColor_BinCountSignal": 7,
        "RoleColor_ReverseSignal": false
    },
    "size": {
        "height": 439,
        "width": 1470
    },
    "chart": "barchartH",
    "view": "2d"
}

const fechaXedad3D = { "colorBin": "quantile", "columns": { "x": "fecha", "sort": "edad", "color": "fecha", "size": "edad", "z": "edad", "y": "edad" }, "directColor": false, "facets": { "columns": 2, "rows": 1 }, "filter": [{ "key": 0, "clause": null, "expressions": [{ "key": 0, "clause": null, "name": "edad", "operator": "<", "value": "100", "unlocked": true, "errorMessage": null }] }, { "key": 0, "clause": "&&", "expressions": [{ "key": 0, "clause": null, "name": "edad", "operator": "<", "value": "100", "unlocked": true, "errorMessage": null }] }], "hideAxes": false, "hideLegend": false, "scheme": "category20", "signalValues": { "RoleZ_ProportionSignal": 0.6, "Text_ScaleSignal": 2, "Text_AngleXSignal": 30, "Text_AngleYSignal": 0, "Mark_OpacitySignal": 1, "RoleColor_BinCountSignal": 7, "RoleColor_ReverseSignal": false }, "size": { "height": 853, "width": 1470 }, "chart": "barchartV", "view": "3d" }