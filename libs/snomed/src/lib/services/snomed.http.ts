import { Injectable } from '@angular/core';
import { Server } from './server.service';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../apps/analytics/src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SnomedHTTP {
  constructor(private http: Server) {
    this.http.setBaseURL(environment.API_URL);
  }

  private branch = 'MAIN/ODONTO/NEUQUEN-20200715-1130';
  private snowstormPath = '/snowstorm';

  descriptions(params: DescriptionParams): Observable<DescriptionResult> {
    if (!params) {
      throw new Error('params is no set');
    }
    if (params.active === undefined) {
      params.active = true;
    }
    if (!params.language) {
      params.language = 'es'
    }

    if (params.conceptActive === undefined) {
      params.conceptActive = true;
    }

    return this.http.get(
      `${this.snowstormPath}/browser/${this.branch}/descriptions`,
      { params }
    );
  }

  concept(sctid) {
    return this.http.get(`${this.snowstormPath}/browser/${this.branch}/concepts/${sctid}`);
  }

  parents(sctid, params) {
    return this.http.get(`${this.snowstormPath}/browser/${this.branch}/concepts/${sctid}/parents`, { params });
  }

  children(sctid, params) {
    return this.http.get(`${this.snowstormPath}/browser/${this.branch}/concepts/${sctid}/children`, { params });
  }

  analytics(query) {
    return this.http.post(`/andes/analytics/${query.visualization}`, query);
  }

  cluster(sctid, semanticTags, asociacion: string) {
    return this.http.post(`/andes/rup/cluster`, {
      conceptId: sctid,
      semanticTags,
      tipoAsociacion: asociacion
    });
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
          };
        });
      })
    );
  }

  filtros(search) {
    return this.http.get('/andes/filtros', { params: search });
  }

  organizaciones() {
    return this.http.get('/andes/organizaciones', {});
  }

  conceptosNumerticos() {
    return this.http.get('/andes/conceptos-numericos', { params: {} });
  }
}


export interface DescriptionParams {
  term: string;
  language?: string;
  semanticTag?: string;
  offset?: number;
  limit?: number;
  active?: boolean;
  conceptActive?: boolean;
}

export interface IConcept {
  conceptId: string;
  moduleId: string;
  active: boolean;
  pt: {
    term: string,
    lang: string
  },
  definitionStatus: 'FULLY_DEFINED' | 'PRIMITIVE',
  fsn: {
    term: string;
    lang: string;
  };
}

export interface DescriptionResult {
  buckets: {
    module?: { [key: string]: number },
    semanticTags?: { [key: string]: number },
    language?: { [key: string]: number },
    membership?: { [key: string]: number }
  };
  items: {
    id: string
    term: string,
    active: boolean,
    languageCode: string,
    module: string,
    concept: IConcept,
  }[];
}