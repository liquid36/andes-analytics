import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-auth-view',
    template: `
        <h3> Unauthorized </h3>
    `
})
export class UnauthorizedView implements OnInit {

    constructor(
    ) { }

    ngOnInit() {

    }

}
