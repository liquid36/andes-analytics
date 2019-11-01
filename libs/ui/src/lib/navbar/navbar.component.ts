import { Component } from '@angular/core';

@Component({
    selector: 'ui-navbar',
    templateUrl: './navbar.component.html'
})
export class NavBarComponent {
    public isCollapsed = true;

    menuItems = [{
        key: 'profesional',
        label: 'Profesional'
    },
    {
        key: 'profesional',
        label: 'Oroganizaciones'
    }, {
        key: 'profesional',
        label: 'Prestaciones'
    }]
}
