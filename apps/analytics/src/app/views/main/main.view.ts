import { Component } from '@angular/core';
import { AppService } from '../../services/app.service';
import { Router } from '@angular/router';

@Component({
    selector: 'andes-main-view',
    templateUrl: './main.view.html',
    styleUrls: ['./main.view.scss']
})
export class MainView {
    title = 'analytics';
    menuItems = [
        { key: 'detail', label: 'Detalle' },
        { key: 'pacientes', label: 'Pacientes' },
        { key: 'organizaciones', label: 'Organizaciones' },
        { key: 'profesionales', label: 'Profesionales' },
        { key: 'prestaciones', label: 'Prestaciones' },
        { key: 'asociados', label: 'Conceptos Asociados' },
        { key: 'mapa', label: 'Mapa' },
        { key: 'bi', label: 'BI' },
    ];

    constructor(
        public appService: AppService,
        private router: Router
    ) {
        this.appService.setNavbarState(true);
    }

    get activeUrl() {
        const url = this.router.url;
        const urlParts = url.split('/');
        if (urlParts.length > 3) {
            return urlParts[3];
        }
        return '';
    }

    navClick($event) {
        const { key } = $event;
        const url = this.router.url;
        const urlParts = url.split('/');
        if (urlParts.length > 2) {
            this.router.navigate(['concept', urlParts[2], key], { queryParamsHandling: 'preserve' });
        }
        // [TODO] show toast
    }
}