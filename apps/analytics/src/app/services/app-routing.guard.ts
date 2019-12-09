
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivate } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';

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