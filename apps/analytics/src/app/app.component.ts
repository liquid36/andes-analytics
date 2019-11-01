import { Component } from '@angular/core';
import { AppService } from './services/app.service';

@Component({
    selector: 'andes-analytics-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'analytics';

    constructor(public appService: AppService) {
        this.appService.setNavbarState(true);
    }
}
