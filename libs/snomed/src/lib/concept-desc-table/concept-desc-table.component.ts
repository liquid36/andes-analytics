import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

function sortTerm(a, b) {
    if (a.active && !b.active) {
        return -1;
    }
    if (!a.active && b.active) {
        return 1;
    }
    if (a.active === b.active) {
        if ((a.acceptable || a.preferred) && (!b.preferred && !b.acceptable)) {
            return -1;
        }
        if ((!a.preferred && !a.acceptable) && (b.acceptable || b.preferred)) {
            return 1;
        }
        if (a.type.conceptId < b.type.conceptId) {
            return -1;
        }
        if (a.type.conceptId > b.type.conceptId) {
            return 1;
        }
        if (a.type.conceptId === b.type.conceptId) {
            if (a.preferred && !b.preferred) {
                return -1;
            }
            if (!a.preferred && b.preferred) {
                return 1;
            }
            if (a.preferred === b.preferred) {
                if (a.term < b.term) {
                    return -1;
                }
                if (a.term > b.term) {
                    return 1;
                }
            }
        }
    }

    return 0;
}

@Component({
    selector: 'snd-concept-desc-table',
    templateUrl: './concept-desc-table.component.html'
})
export class ConceptDescTableComponent {
    public static ISA = '116680003';
    public static INFERRED = '900000000000011006';
    public static STATED = '900000000000010007';

    public termCount = {};

    @Input() refSetLanguage;
    @Input() concept;

    @Input() set terms$(value: Observable<any>) {
        value.subscribe(stats => {
            this.termCount = {};
            stats.forEach((item) => {
                this.termCount[item.term] = item.value;
            });
        });

    }

    get terms() {
        function checkLang(desc, refset) {
            return desc.acceptability && !!desc.acceptability.find(i => i.languageReferenceSet.conceptId === refset.conceptId);
        }
        const terms: any[] = this.concept.descriptions.filter(desc => checkLang(desc, this.refSetLanguage)).filter(desc => desc.active);
        const t = terms.map(desc => {
            let preferred = false;
            let acceptable = false;
            const acceptability = desc.acceptability.find(i => i.languageReferenceSet.conceptId === this.refSetLanguage.conceptId);
            if (acceptability.acceptability.conceptId === '900000000000548007') {
                preferred = true;
            } else {
                if (acceptability.acceptability.conceptId === '900000000000549004') {
                    acceptable = true;
                }
            }
            return {
                ...desc,
                preferred,
                acceptable
            };
        }).sort(sortTerm);
        return t;
    }

    get languageName() {
        switch (this.refSetLanguage.conceptId) {
            case '900000000000508004':
                return 'GB';
            case '900000000000509007':
                return 'US';
            case '450828004':
            case '231000013101':
                return 'ES';
            case '554461000005103':
                return 'DA';
            case '46011000052107':
                return 'SV';
            case '32570271000036106':
                return 'AU';
            case '999001251000000103':
                return 'UK';
            case '31000146106':
                return 'NL';
        }
    }

}
