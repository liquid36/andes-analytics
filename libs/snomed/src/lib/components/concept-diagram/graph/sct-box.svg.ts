import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, OnChanges } from '@angular/core';

@Component({
    selector: '[sctBox]',
    templateUrl: './sct-box.svg.html'
})
export class SctBoxComponent implements AfterViewInit, OnChanges {
    @Input() x: number;
    @Input() y: number;
    @Input() label: string;
    @Input() sctid: string;
    @Input() type: string;
    @ViewChild('testBox', { static: false }) testBox: ElementRef;

    public widthPadding = 20;
    get heightpadding() {
        if (!this.label || !this.sctid) {
            return 15;
        }
        return 25;
    }
    public fontFamily = '"Helvetica Neue",Helvetica,Arial,sans-serif';
    public get testText() {
        let testText = 'Test';
        if (this.label && this.sctid) {
            if (this.label.length > this.sctid.toString().length) {
                testText = this.label;
            } else {
                testText = this.sctid.toString();
            }
        } else if (this.label) {
            testText = this.label;
        } else if (this.sctid) {
            testText = this.sctid.toString();
        }
        return testText;
    }

    get textHeight() {
        return this.testBox ? this.testBox.nativeElement.getBBox().height : 0;
    }

    get textWidth() {
        return this.testBox ? Math.round(this.testBox.nativeElement.getBBox().width * 1.2) : 0;
    }

    get bbox() {
        this.cd.detectChanges();
        return this.el.nativeElement.getBBox();
    }

    constructor(private cd: ChangeDetectorRef, private el: ElementRef) { }


    ngOnChanges() {
        this.cd.detectChanges();
    }
    ngAfterViewInit() {
        this.cd.detectChanges();
    }




}
