import { Component, ViewChild, DebugElement } from '@angular/core';
import { SnomedAPI } from '../../services/snomed.service';
import { QueryOptionsService } from '../../services/query-filter.service';
import { combineLatest, BehaviorSubject, forkJoin, Subject } from 'rxjs';
import { pluck, switchMap, map, merge, startWith, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { cache, combineDataset } from '../../operators';

@Component({
    selector: 'app-maps-stats-view',
    templateUrl: './maps-stats.view.html'
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

    constructor(
        private snomed: SnomedAPI,
        private qf: QueryOptionsService,
        private activeRoute: ActivatedRoute
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
                        this.snomed.organizaciones2(),
                        this.snomed.analytics(concept.conceptId, 'count', 'organizacion'),

                    );
                })
            ),
            this.map$
        ).pipe(
            map(([data, map]) => {
                const org2 = data[1];
                const realOrg = data[2];
                data[0] = (data[0] as any).map((item) => {
                    return { location: new (window as any).google.maps.LatLng(item.lat, item.lng), weight: 2 };
                });
                const heatmap = new (window as any).google.maps.visualization.HeatmapLayer({
                    data: data[0],
                    maxIntensity: 25,
                });
                heatmap.setMap(map);
                heatmap.set('radius', 12);
                heatmap.set('opacity', 0.8);

                realOrg.forEach((item) => {
                    const id = item._id.organizacion;
                    const dataOrg = org2.find((item) => item._id === id);
                    if (dataOrg) {

                        var marker = new (window as any).google.maps.Marker({
                            position: { lat: dataOrg.direccion.geoReferencia[0], lng: dataOrg.direccion.geoReferencia[1] },
                            map: map,
                            title: 'Hello World!'
                        });
                    }
                })

            })
        ).subscribe()
    }

    onMap(map) {
        this.map.next(map);
    }


}
