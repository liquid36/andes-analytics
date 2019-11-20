import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { switchMap, map } from 'rxjs/operators';
import { SnomedAPI } from '../../../services/snomed.service';

@Component({
    selector: 'app-navbar-detail-component',
    templateUrl: './navbar-detail.component.html',
    styleUrls: ['./navbar-detail.component.scss']
})
export class AppNavbarDetailComponent {


    @Input() concept;





}
