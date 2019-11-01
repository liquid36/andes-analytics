import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-navbar-detail-component',
    templateUrl: './navbar-detail.component.html',
    styleUrls: ['./navbar-detail.component.scss']
})
export class AppNavbarDetailComponent {
    @Input() concept;
}
