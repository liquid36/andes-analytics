import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'ui-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavBarComponent {
    public isCollapsed = true;
    @Input() menuItems = [{
        key: 'profesional',
        label: 'Profesional'
    },
    {
        key: 'profesional',
        label: 'Oroganizaciones'
    }, {
        key: 'profesional',
        label: 'Prestaciones'
    }];
    @Output() itemClick = new EventEmitter();


    navClick(menuItem) {
        this.itemClick.emit(menuItem);
    }
}
