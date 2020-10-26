import { Component, Input } from '@angular/core';


@Component({
    selector: 'app-histograma-chart-component',
    templateUrl: './histograma-charts.component.html'
})
export class AppHistogramaChartsView { 

    @Input() public data;

    public dataGraph;

    public graph = { 
        boxplot: { 
             width: 850, 
            height: 200,
            margin: {
                t: 0,
                l: 0,
                r: 0
            },
            xaxis: {
                type: 'category'
            }
        },
    };

    processData() { 
         const datos = this.data.map(d => ({
             label: d.label.fecha,
             value: d.value.total
         })).sort((a,b) => a.label.localeCompare(b.label));

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
        const ids = datos.map(c => c.label );
        const y = datos.map(c => c.value);
        this.dataGraph = [{ 
            type: "bar",
            x: ids, 
            y: y,
           
            
        }];
    }

    constructor(
    ) {

    }
}
