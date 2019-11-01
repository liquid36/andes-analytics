import { Directive, Renderer, ElementRef, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { Observable, fromEvent, Subscription } from 'rxjs';
import { map, tap, debounce, debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

@Directive({
    selector: 'input[uiText]',
    exportAs: 'uiText',
    host: {
        '[class.form-control]': 'true',
        '[attr.type]': '"text"'
    },
    // providers: [NGB_TYPEAHEAD_VALUE_ACCESSOR]
})
export class UiTextDirective implements ControlValueAccessor, OnInit, OnDestroy {
    @Input() uiText: (text: Observable<string>) => Observable<any>;
    @Input() debounce: number;
    @Input() distinct: boolean = false;

    @Output() write = new EventEmitter<string>();

    private _valueChanges: Observable<string>;
    private _subscription: Subscription;

    public onChange = (_: any) => { };

    constructor(private renderer: Renderer, private el: ElementRef) {
        this._valueChanges = fromEvent<Event>(this.el.nativeElement, 'input').pipe(
            map($event => ($event.target as HTMLInputElement).value)
        );
    }

    ngOnInit(): void {
        let inputValues$ = this._valueChanges.pipe(
            tap(value => {
                this.onChange(value);
            })
        );
        if (debounce) {
            inputValues$ = inputValues$.pipe(debounceTime(this.debounce));
        }
        if (this.distinct) {
            inputValues$ = inputValues$.pipe(distinctUntilChanged());
        }
        if (this.uiText) {
            inputValues$ = inputValues$.pipe(this.uiText);
        }

        this._subscription = inputValues$.subscribe((text) => {
            this.write.emit(text);
        })
    }

    ngOnDestroy() {
        if (this._subscription) {
            this._subscription.unsubscribe();
        }
    }

    writeValue(value: any) {
        this.renderer.setElementProperty(this.el.nativeElement, 'value', typeof value === 'undefined' ? '' : value);
    }

    registerOnChange(fn: any) {
        this.onChange = (value) => {
            value = value || null;
            fn(value);
        };
    }

    registerOnTouched() {

    }

}