import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import * as d3 from 'd3';

@Component({
    selector: 'app-treemap-chart-component',
    templateUrl: './treemap-chart.component.html'
})
export class AppTreeChartsView { 

    @Input() public data;

    public dataGraph;

    public graph = { 
        boxplot: { 
            width: window.innerWidth * 0.98, 
            height: window.innerHeight * 0.98,
            margin: {
                t: 10,
                l: 10,
                r: 10
            }
        },
    };

    processData() { 
        const datos = this.data.sort((a, b) => b.total - a.total).slice(0, 100);
        datos.forEach((concepto) => {
            const { _id, statedAncestors } = concepto; 
            for (const parent of (statedAncestors || []).reverse()) {
                const p = datos.find(i => i._id === parent);
                if (p) {
                    concepto.parent =  p._id; 
                    break;
                }
            }

        });
        return datos;
    }

    ngOnChanges() {
        this.reload();
    } 

    ngAfterViewInit() {
        this.reload();
    }

    reload() { 
        const datos = this.processData();
        const ids = datos.map(c => c._id );
        const labels = datos.map(c => c.label);
        const parents = datos.map(c => c.parent || '');
        const values = datos.map(c => c.total);
        this.dataGraph = [{
            type: "treemap",
            ids: ids,
            labels: labels,
            parents: parents,
            values: values, 
            textinfo: "label+value entry",
            // domain: {"x": [0, 0.48]},
            count: 'branches+leaves',
            textfont: {"size": 30, "color": "#ffffff"},
            marker: {"line": {"width": 2}},
            pathbar: {"visible": false}
        }];
    }

    constructor(
    ) {

    }
}
