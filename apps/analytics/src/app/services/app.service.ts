
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AppService {
    private navbar = new BehaviorSubject<Boolean>(true);
    private navbar$ = this.navbar.asObservable();

    setNavbarState(value: Boolean) {
        this.navbar.next(value);
    }

    tootleNavbarState() {
        const value = !this.navbar.getValue();
        this.navbar.next(value);
    }

    get navbarState() {
        return this.navbar$;
    }
}
