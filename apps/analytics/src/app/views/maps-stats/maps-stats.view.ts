import { Component, ViewChild, DebugElement } from '@angular/core';
import { SnomedAPI } from '../../services/snomed.service';
import { QueryOptionsService } from '../../services/query-filter.service';
import { combineLatest, BehaviorSubject, forkJoin, Subject } from 'rxjs';
import { pluck, switchMap, map, merge, startWith, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { cache, combineDataset } from '../../operators';
import { Location } from '@angular/common';

const groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};

@Component({
    selector: 'app-maps-stats-view',
    templateUrl: './maps-stats.view.html',
    styleUrls: ['./maps-stats.view.scss']
})
export class AppMapsStatsView {
    public lat = -38.9176284;
    public lng = -69.9546118;
    public zoom = 5;

    map = new Subject();
    map$ = this.map.asObservable();

    public loading = false;
    public concept$;
    public organizaciones$;
    public data$;

    public mapsCache;

    public heatsValue: any[];
    public orgMarkers: any[] = [];
    public showOrganizaciones = false;

    constructor(
        private snomed: SnomedAPI,
        private qf: QueryOptionsService,
        private activeRoute: ActivatedRoute,
        private location: Location
    ) {
        this.concept$ = this.activeRoute.paramMap.pipe(
            map((dto: any) => dto.params),
            pluck('id'),
            switchMap((conceptId) => this.snomed.concept(conceptId)),
            cache()
        )


        this.organizaciones$ = combineLatest(
            this.concept$.pipe(
                switchMap((concept: any) => {
                    return forkJoin(
                        this.snomed.maps(concept.conceptId),
                        this.snomed.organizaciones(),
                        this.snomed.analytics(concept.conceptId, 'count', 'organizacion'),
                        // this.snomed.analytics(concept.conceptId, 'raw'),
                    );
                })
            ),
            this.map$
        ).pipe(
            map(([data, map]) => {
                this.mapsCache = map;
                this.heatsValue = data[0]; // data[0].map(i => i.value);
                const org2 = data[1];
                const realOrg = data[2];
                const WINDOW: any = window;

                const heatPoints = this.heatsValue.map((item) => {
                    if (item.lat) {
                        // const location = new WINDOW.google.maps.LatLng(item.latitud, item.longitud);
                        const location = new WINDOW.google.maps.LatLng(item.lat, item.lng);
                        return {
                            location,
                            weight: 2
                        };
                    }
                });

                const heatmap = new WINDOW.google.maps.visualization.HeatmapLayer({
                    data: heatPoints,
                    maxIntensity: 25,
                });
                heatmap.setMap(this.mapsCache);
                heatmap.set('radius', 12);
                heatmap.set('opacity', 0.8);

                realOrg.forEach((item) => {
                    const id = item._id.organizacion;
                    const dataOrg = org2.find((item) => item._id === id);
                    if (dataOrg) {
                        if (dataOrg.direccion && dataOrg.direccion.geoReferencia) {
                            const marker = new (window as any).google.maps.Marker({
                                position: { lat: dataOrg.direccion.geoReferencia[0], lng: dataOrg.direccion.geoReferencia[1] },
                                // map: this.mapsCache,
                                // title: 'Hello World!'
                            });

                            this.orgMarkers.push(marker);

                        }
                    }
                });



            })
        ).subscribe()
    }

    onMap(map) {
        this.map.next(map);
    }

    cerrar() {
        this.location.back();
    }

    onToggleEfectores() {
        if (this.showOrganizaciones) {
            this.showOrganizaciones = false;
        } else {
            this.showOrganizaciones = true;
        }
        this.orgMarkers.forEach(m => m.setMap(this.showOrganizaciones ? this.mapsCache : null));
    }

}


// animationHeatLayers() {
//     const heatsLayers = [];
//                 const groupByFecha = groupBy(this.heatsValue, 'fecha');
//                 const fechaKey = Object.keys(groupByFecha).sort((a, b) => (a.localeCompare(b)));
//                 fechaKey.forEach((key) => {
//                     const data = groupByFecha[key];

//                     const heatPoints = data.map((item) => {
//                         if (item.latitud) {
//                             return {
//                                 location: new WINDOW.google.maps.LatLng(item.latitud, item.longitud),
//                                 weight: 2
//                             };
//                         }
//                     });
//                     const heatmap = new WINDOW.google.maps.visualization.HeatmapLayer({
//                         data: heatPoints,
//                         maxIntensity: 25,
//                     });
//                     heatmap.setMap(null);
//                     heatmap.set('radius', 12);
//                     heatmap.set('opacity', 0.8);

//                     heatsLayers.push(heatmap);
//                 })

//                 let i = 0;
//                 setInterval(() => {
//                     let prevID = i;
//                     i++;
//                     if (i === heatsLayers.length) {
//                         i = 0;
//                     }
//                     heatsLayers[prevID].setMap(null);
//                     heatsLayers[i].setMap(this.mapsCache)




//                 }, 1000)
// }