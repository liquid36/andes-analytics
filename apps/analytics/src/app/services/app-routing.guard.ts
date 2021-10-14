
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class RoutingGuard implements CanActivate {
    constructor(private auth: AuthService, private router: Router) { }

    canActivate() {
        if (!environment.production) {
            return true;
        }
        if (this.auth.isLoggin()) {
            return true;
        } else {
            this.router.navigate(['/unauthorized']);
            return false;
        }
    }
}