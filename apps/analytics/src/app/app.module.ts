import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { UiModule } from '@andes-analytics/ui';
import { SnomedModule } from '@andes-analytics/snomed';

import { AppComponent } from './app.component';
import { SnomedSearchComponent } from './components/snomed-concept-search/snomed-search.component';
import { ConceptCountPillComponent } from './elements/concept-count-pill/concept-count-pill.component';
import { ConceptDefinitionStatusIconComponent } from './elements/concept-definition-status-icon/concept-definition-status-icon.component';
import { AppQueryOptionsComponent } from './components/app-query-options/app-query-options.component';
import { AppConceptDetailView } from './views/concept-detail/concept-detail.view';
import { AppNavbarDetailComponent } from './views/concept-detail/navbar-detail/navbar-detail.component';
import { AppConceptStatsComponent } from './views/concept-detail/concept-stats/concept-stats.component';

@NgModule({
  declarations: [
    AppComponent,
    SnomedSearchComponent,
    ConceptCountPillComponent,
    ConceptDefinitionStatusIconComponent,
    AppQueryOptionsComponent,
    AppConceptDetailView,
    AppNavbarDetailComponent,
    AppConceptStatsComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    FormsModule,
    NgbModule,
    RouterModule.forRoot([
      { path: '', component: AppConceptDetailView }
    ], { initialNavigation: 'enabled' }),
    UiModule,
    SnomedModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
