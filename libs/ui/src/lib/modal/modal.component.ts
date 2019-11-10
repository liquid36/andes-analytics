import { Component, Input } from '@angular/core';

@Component({
    selector: 'ui-modal',
    template: `
        <div *ngIf="showed" class="ui-modal" (click)="$event.stopPropagation();close();">
            <div class="ui-modal-content" (click)="$event.stopPropagation();">
                <ng-content></ng-content> 
            </div>
        </div>
    `,
})
export class UiModalComponent {

    @Input() allowClose = false;

    showed = false;

    public show() {
        this.showed = true;
    }

    public close() {
        this.showed = false;
    }
}
