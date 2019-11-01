import { Component, Input } from '@angular/core';

@Component({
    selector: 'ui-badge',
    templateUrl: './badge.component.html'
})
export class BadgeComponent {
    @Input() label = '';
    @Input() pill = null;
    @Input() type = 'success';
}
