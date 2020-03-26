import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';

export interface Options {
    params?: any;
    showError?: boolean;
    showLoader?: boolean;
}

// Constantes
const defaultOptions: Options = { params: null, showError: true, showLoader: true };

@Injectable({
    providedIn: 'root',
})
export class Server {
    private baseURL: string;
    private authToken: string;

    constructor(private http: HttpClient) {
        this.authToken = window.sessionStorage.getItem('token');
    }

    setToken(token) {
        window.sessionStorage.setItem('token', token);
        this.authToken = token;
    }

    getToken() {
        return this.authToken;
    }

    private parse(data: any): any {
        let dateISO = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:[.,]\d+)?Z/i;
        let dateNet = /\/Date\((-?\d+)(?:-\d+)?\)\//i;
        const traverse = function (o, func) {
            for (let i of Object.keys(o)) {
                o[i] = func.apply(this, [i, o[i]]);
                if (o[i] !== null && typeof (o[i]) === 'object') {
                    traverse(o[i], func);
                }
            }
        }
        const replacer = function (key, value) {
            if (typeof (value) === 'string') {
                if (dateISO.test(value)) {
                    return new Date(value);
                }
                if (dateNet.test(value)) {
                    return new Date(parseInt(dateNet.exec(value)[1], 10));
                }
            }
            return value;
        };
        traverse(data, replacer);
        return data;

    }

    private stringify(object: any) {
        return JSON.stringify(object);
    }

    private prepareOptions(options: Options) {
        const result = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                "Accept-Language": "es"
            }),
            params: options ? options.params : null
        };
        if (this.authToken) {
            result.headers = result.headers.set('Authorization', 'JWT ' + this.authToken)
        }
        return result;
    }

    private getAbsoluteURL(url: string) {
        if (url.toLowerCase().startsWith('http')) {
            return url;
        } else {
            return this.baseURL + url;
        }
    }

    setBaseURL(baseURL: string) {
        this.baseURL = baseURL;
    }

    get(url: string, options: Options = defaultOptions): Observable<any> {
        return this.http.get(this.getAbsoluteURL(url), this.prepareOptions(options));
    }

    post(url: string, body: any, options: Options = null): Observable<any> {
        return this.http.post(this.getAbsoluteURL(url), this.stringify(body), this.prepareOptions(options));
    }

    put(url: string, body: any, options: Options = defaultOptions): Observable<any> {
        return this.http.put(this.getAbsoluteURL(url), this.stringify(body), this.prepareOptions(options))
            .pipe(map((res: Response) => this.parse(res.body)));
    }

    patch(url: string, body: any, options: Options = defaultOptions): Observable<any> {
        return this.http.patch(this.getAbsoluteURL(url), this.stringify(body), this.prepareOptions(options))
            .pipe(map((res: Response) => this.parse(res.text())));
    }

    delete(url: string, options: Options = defaultOptions): Observable<any> {
        return this.http.delete(this.getAbsoluteURL(url), this.prepareOptions(options))
            .pipe(map((res: Response) => this.parse(res.text())));
    }
}
