import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { pluck, switchMap, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Component({
    selector: 'app-auth-view',
    template: `Login...`
    // templateUrl: './home.view.html'
})
export class AuthView implements OnInit {

    constructor(
        private activeRouter: ActivatedRoute,
        private auth: AuthService,
        private router: Router
    ) { }

    ngOnInit() {
        this.activeRouter.queryParams.pipe(
            pluck('token'),
            switchMap((token) => {
                return this.auth.login(token)
            }),
        ).subscribe(() => {
            this.router.navigate(['/home']);
        }, () => {
            this.router.navigate(['/unauthorized'])
        })
    }

}
