import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';

@Component({
    selector: 'app-demografia-table',
    templateUrl: './demografia-table.component.html'
})
export class DemografiaTableComponent implements OnInit, OnChanges {

    @Input() data;
    @Input() rangoEtario = [0, 1, 2, 6, 10, 15, 50];

    // public nacional = [0, 1, 2, 6, 10, 15, 50];
    // public provincial = [0, 1, 5, 15, 20, 40, 70];

    public conceptSelected = null;
    public tableDemografia = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    public numCols = 0;
    public mappingIndex = {};

    indices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    crearTabla() {
        this.numCols = 0;
        this.mappingIndex = {};
        this.rangoEtario.forEach((value, i) => {
            this.numCols++;
            this.mappingIndex[value] = i;
        });
        this.tableDemografia = [
            Array(this.numCols + 1).fill(0),
            Array(this.numCols + 1).fill(0),
            Array(this.numCols + 1).fill(0)
        ];
        this.indices = Array(this.numCols);
        for (let i = 0; i < this.numCols; i++) {
            this.indices[i] = i;
        }
    }

    ngOnChanges() {
        this.crearTabla();
        if (this.data) {
            this.data.forEach(dato => {
                const i = dato._id.sexo === 'masculino' ? 0 : 1;
                const j = this.mappingIndex[dato._id.decada];

                this.tableDemografia[i][j] += dato.value.total;
                this.tableDemografia[2][j] += dato.value.total;
                this.tableDemografia[i][this.numCols] += dato.value.total;
                this.tableDemografia[2][this.numCols] += dato.value.total;
            });
        }
    }

    ngOnInit() {

    }


}
