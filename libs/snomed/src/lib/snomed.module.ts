import { NgModule, ModuleWithProviders, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConceptDescTableComponent } from './components/concept-desc-table/concept-desc-table.component';
import { SndGraphNavComponent } from './components/concept-diagram/graph-nav.component';
import { CircleNodeComponent } from './components/concept-diagram/graph/circle-node.svg';
import { ConnectElementComponent } from './components/concept-diagram/graph/connect-element.svg';
import { SctBoxComponent } from './components/concept-diagram/graph/sct-box.svg';
import { BASE_URL, Server } from './services/server.service';
import { SnomedHTTP } from './services/snomed.http';
import { ConceptParentsComponent } from './components/concept-parents/concept-parents.component';
import { ConceptChildrensComponent } from './components/concept-childrens/concept-childrens.component';
import { SemTagPipe } from './pipes/semtag.pipes';
import { TermPipe } from './pipes/term.pipes';

@NgModule({
    imports: [CommonModule],
    declarations: [
        ConceptDescTableComponent,
        SndGraphNavComponent,
        CircleNodeComponent,
        ConnectElementComponent,
        SctBoxComponent,
        ConceptParentsComponent,
        ConceptChildrensComponent,
        SemTagPipe,
        TermPipe


    ],
    exports: [
        ConceptDescTableComponent,
        SndGraphNavComponent,
        ConceptParentsComponent,
        ConceptChildrensComponent,
        SemTagPipe,
        TermPipe
    ]

})
export class SnomedModule {
    static forRoot(baseURL: string): ModuleWithProviders {
        return {
            ngModule: SnomedModule,
            providers: [
                { provide: BASE_URL, useValue: baseURL },
                Server,
                SnomedHTTP,
                {
                    provide: APP_INITIALIZER,
                    useFactory: appLoadFactory,
                    deps: [SnomedHTTP],
                    multi: true,
                },
            ]
        };
    }
}

function appLoadFactory(config: SnomedHTTP) {
    return () => config.load();
}