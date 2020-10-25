import { IConcept } from '@andes-analytics/snomed';
import { Injectable } from "@angular/core";
import { of } from 'rxjs';
import { Server } from '../../../../../libs/snomed/src/lib/services/server.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private http: Server) { }

    public registerConcepto(concepto: IConcept) {
        if (environment.production) {
            return this.http.post('/user/frecuentes', concepto);
        } else {
            return of(null);
        }
    }

    public misFrecuentes() {
        if (environment.production) {
            return this.http.get('/user/frecuentes');
        } else {
            return of([]);
        }
    }
}



