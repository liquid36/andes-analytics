
import { Server } from '@andes-analytics/snomed';
import { Injectable } from '@angular/core';
import jwt_decode from "jwt-decode";
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    constructor(
        private http: Server
    ) {
        this.http.setBaseURL(environment.API_URL);
    }

    public login(token) {
        return this.http.post('/auth/login', { token }).pipe(
            tap((response) => this.http.setToken(response.token))
        );
    }

    public isLoggin() {
        return !!this.http.getToken();
    }

    check(key: string) {
        const token = this.http.getToken();
        const metadata: any = jwt_decode(token);
        const permisos: string[] = metadata.permisos;

        const full = permisos.findIndex(p => p === 'analytics:*' || p === key);
        return full !== -1;
    }

}
