import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConceptDescTableComponent } from './components/concept-desc-table/concept-desc-table.component';
import { SndGraphNavComponent } from './components/concept-diagram/graph-nav.component';
import { CircleNodeComponent } from './components/concept-diagram/graph/circle-node.svg';
import { ConnectElementComponent } from './components/concept-diagram/graph/connect-element.svg';
import { SctBoxComponent } from './components/concept-diagram/graph/sct-box.svg';
import { Server } from './services/server.service';
import { SnomedHTTP } from './services/snomed.http';
import { ConceptParentsComponent } from './components/concept-parents/concept-parents.component';
import { ConceptChildrensComponent } from './components/concept-childrens/concept-childrens.component';

@NgModule({
    imports: [CommonModule],
    declarations: [
        ConceptDescTableComponent,
        SndGraphNavComponent,
        CircleNodeComponent,
        ConnectElementComponent,
        SctBoxComponent,
        ConceptParentsComponent,
        ConceptChildrensComponent

    ],
    exports: [
        ConceptDescTableComponent,
        SndGraphNavComponent,
        ConceptParentsComponent,
        ConceptChildrensComponent
    ]

})
export class SnomedModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: SnomedModule,
            providers: [
                Server,
                SnomedHTTP
            ]
        };
    }
} 