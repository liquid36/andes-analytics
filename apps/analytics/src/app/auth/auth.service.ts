
import { Injectable } from '@angular/core';
import { Server } from '@andes-analytics/snomed';
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

}
