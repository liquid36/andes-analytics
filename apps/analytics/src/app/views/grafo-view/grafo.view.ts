import { Component, ViewChild, ElementRef } from '@angular/core';
import { SnomedAPI } from '../../services/snomed.service';
import { QueryOptionsService } from '../../services/query-filter.service';
import { combineLatest, BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { pluck, switchMap, map, merge, startWith, tap, take } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { cache, combineDataset } from '../../operators';
import { Location } from '@angular/common';
import ForceGraph, { ForceGraphInstance } from 'force-graph';

@Component({
    selector: 'app-grafo-view',
    templateUrl: './grafo.view.html',
    styles: [`
        .cuadrado {
            display: inline-block;
            width: 16px;
            height: 16px;
        }
    `]
})
export class AppGrafoView {
    public concept$: Observable<any>;
    public data$;

    public key1$ = new BehaviorSubject<string>('prestacion');
    public key2$ = new BehaviorSubject<string>('profesional');

    public colores = {
        prestacion: 'red',
        profesional: 'blue',
        organizacion: 'green',
        paciente: '#ffc41ee6',
        localidad: '#1effe0e6',
        sexo: '#ff1ef8e6',
        decada: '#361effe6'
    }


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

        combineLatest(
            this.concept$,
            this.qf.filstrosParams$.pipe(startWith({})),
            this.key1$,
            this.key2$
        ).pipe(
            switchMap(([concepto, _, key1, key2]) => {
                return this.snomed.analytics(concepto.conceptId, 'count', [key1, key2]).pipe(map((data) => [data, key1, key2]));
            }),
        ).subscribe(([data, key1, key2]) => {
            const dataSet = data;
            const dom = this.grafo.nativeElement;

            const nodes = {};
            const edge = []

            dataSet.forEach((elem) => {
                if (!nodes['k1' + elem._id[key1]]) {
                    nodes['k1' + elem._id[key1]] = {
                        id: 'k1' + elem._id[key1],
                        label: elem.label[key1],
                        key: key1
                    };
                }
                if (!nodes['k2' + elem._id[key2]]) {
                    nodes['k2' + elem._id[key2]] = {
                        id: 'k2' + elem._id[key2],
                        label: elem.label[key2],
                        key: key2
                    };
                }
                edge.push({
                    source: 'k1' + elem._id[key1],
                    target: 'k2' + elem._id[key2],
                    value: elem.value.total
                });
            })

            if (this.Graph) {
                this.Graph._destructor();
            }
            this.Graph = ForceGraph()(dom)
                .backgroundColor('#101020')
                .nodeRelSize(6)
                .nodeAutoColorBy('user')
                .nodeLabel((node: any) => `${node.label}`)
                .nodeColor((node: { id: string, key: string }) => this.colores[node.key])
                .linkColor((node) => 'rgba(255,255,255,0.2)')
                .graphData({
                    nodes: Object.values(nodes),
                    links: edge
                });


        })
    }


    @ViewChild('grafo', { static: false }) grafo: ElementRef;
    Graph: ForceGraphInstance;

    cerrar() {
        this.Graph._destructor();
        this.location.back();
    }
}
