
import { Injectable } from '@angular/core';
import { Server } from './server.service';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SnomedHTTP {
    constructor(
        private http: Server
    ) {
        this.http.setBaseURL(environment.API_URL);
    }

    private database = 'es-edition';
    private version = 'v20190722';
    private path = '/snomed';

    descriptions(params) {
        return this.http.get(`${this.path}/${this.database}/${this.version}/descriptions`, { params });
    }

    concept(sctid) {
        return this.http.get(`${this.path}/${this.database}/${this.version}/concepts/${sctid}`).pipe(
            map(concept => {
                concept.definitionStatus = concept.definitionStatus.conceptId;
                concept.fsn = concept.fullySpecifiedName;
                delete concept.fullySpecifiedName;
                return concept;
            })
        );
    }

    concepts(sctids) {
        return this.http.get(`${this.path}/${this.database}/${this.version}/concepts`, {
            params: {
                sctids
            }
        });
    }

    parents(sctid, params) {
        return this.http.get(`${this.path}/${this.database}/${this.version}/concepts/${sctid}/parents`, { params });
    }

    children(sctid, params) {
        return this.http.get(`${this.path}/${this.database}/${this.version}/concepts/${sctid}/children`, { params });
    }


    analytics(query) {
        return this.http.post(`/andes/analytics/count`, query);
    }

    demografia(params) {
        return this.http.post(`/andes/rup/demografia`, params);
    }

    cluster(sctid, semanticTags) {
        return this.http.post(`/andes/rup/cluster`, { conceptId: sctid, semanticTags });
    }

    maps(sctid) {
        return this.http.post(`/andes/rup/maps`, { conceptId: sctid });
    }

    terms(sctid, filters) {
        const body = {
            target: `!${sctid}`,
            filter: filters,
            group: 'term'
        };
        return this.http.post(`/andes/analytics/count`, body).pipe(
            map(res => res[sctid]),
            map(terms => {
                return terms.map(item => {
                    return {
                        term: item._id.term,
                        value: item.value.total
                    }
                })
            })
        );
    }

    organizaciones(search) {
        return this.http.get('/andes/organizaciones', { params: { search } });
    }

    semanticTags(search) {
        return this.http.get('/andes/semanticTags', { params: { search } });
    }
}
