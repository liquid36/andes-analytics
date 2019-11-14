import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import * as d3 from 'd3';

@Component({
    selector: 'app-bubble-charts-component',
    templateUrl: './bubble-charts.component.html'
})
export class AppBubbleChartsView {
    @ViewChild('contenedor', { static: false }) contenedor: ElementRef;

    @Input() public data;

    processData() {
        const newDataSet = [];

        this.data.sort((a, b) => b.total - a.toal).slice(0, 50).forEach((item) => {
            newDataSet.push({ name: item.label, className: 'asd', value: item.total });
        });
        return { children: newDataSet };
    }

    ngOnChanges() {
        this.reload();
    }

    ngAfterViewInit() {
        this.reload();
    }

    reload() {
        this.contenedor.nativeElement.innerHTML = '';
        const diameter = 600;
        // const color: any = d3.scaleOrdinal(this.data.map(d => d.label))
        const svg = d3.select(this.contenedor.nativeElement).append('svg')
            .attr('width', window.innerWidth * 80 / 100)
            .attr('height', window.innerHeight * 80 / 100)
            .attr("font-family", "sans-serif")
            .attr("text-anchor", "middle");

        const zoom = d3.zoom().on('zoom', () => {
            svg.attr('transform', d3.event.transform);
        });
        svg.call(zoom);

        const bubble = d3.pack()
            .size([window.innerWidth * 80 / 100, window.innerHeight * 80 / 100])
            // .value(function (d: any) { return d.size; })
            // .sort(function(a, b) {
            // 	return -(a.value - b.value)
            // }) 
            .padding(3)(d3.hierarchy(this.processData()).sum((d: any) => d.value));

        // generate data with calculated layout values
        const nodes = bubble.leaves(); // filter out the outer bubble
        // const color = d3.scaleOrdinal(this.data.map(d => d.group), d3.schemeCategory10)

        const vis = svg.selectAll('circle').data(nodes)
            .join("g")
            .attr("transform", d => `translate(${d.x + 1},${d.y + 1})`);



        function hex(c) {
            var s = "0123456789abcdef";
            var i = parseInt(c);
            if (i == 0 || isNaN(c))
                return "00";
            i = Math.round(Math.min(Math.max(0, i), 255));
            return s.charAt((i - i % 16) / 16) + s.charAt(i % 16);
        }
        vis.append('circle')
            .attr("r", (d: any) => d.r)
            .attr("fill-opacity", 0.7)
            .attr("fill", (d: any) => {
                const h = hex(d.r);
                return '#' + h + 'A';
            });

        vis.append("text")
            .style("font-size", function (d) {
                const cantWords = (d as any).data.name.split(' ').length;
                const lengthWord = Math.max(...((d as any).data.name.split(' ').map(t => t.length)));
                if (cantWords > 5 || lengthWord > 14) {
                    return Math.min(2 * (d as any).r, (2 * (d as any).r - 8) / 160 * 24) + "px";
                } else {
                    return Math.min(2 * (d as any).r, (2 * (d as any).r - 8) / 120 * 24) + "px";
                }
            })
            .attr("dy", ".35em")
            .selectAll("tspan")
            .data((d: any) => d.data.name.split(/(\ )/g).filter(c => c !== ' '))
            .join("tspan")
            .attr("x", 0)
            .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.8}em`)
            .text((d: any) => d)

        // vis.enter().append("text")
        //     .attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')'; })
        //     .attr("x", 0)
        //     .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.8}em`)
        //     .text((d: any) => d.data.name);
    }

    constructor(
    ) {

    }
}
