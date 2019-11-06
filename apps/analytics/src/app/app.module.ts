import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { UiModule } from '@andes-analytics/ui';
import { SnomedModule } from '@andes-analytics/snomed';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

import { AppComponent } from './app.component';
import { SnomedSearchComponent } from './components/snomed-concept-search/snomed-search.component';
import { ConceptCountPillComponent } from './elements/concept-count-pill/concept-count-pill.component';
import { ConceptDefinitionStatusIconComponent } from './elements/concept-definition-status-icon/concept-definition-status-icon.component';
import { AppQueryOptionsComponent } from './components/app-query-options/app-query-options.component';
import { AppNavbarDetailComponent } from './views/concept-detail/navbar-detail/navbar-detail.component';
import { AppConceptStatsComponent } from './views/concept-detail/concept-stats/concept-stats.component';


import { AppConceptDetailView } from './views/concept-detail/concept-detail.view';
import { AppHomeView } from './views/home/home.view';
import { AppPacientesStatsView } from './views/pacientes-stats/pacientes-stats.view';
import { DemografiaTableComponent } from './views/pacientes-stats/demografia-table/demografia-table.component';

@NgModule({
  declarations: [
    AppComponent,
    SnomedSearchComponent,
    ConceptCountPillComponent,
    ConceptDefinitionStatusIconComponent,
    AppQueryOptionsComponent,
    AppConceptDetailView,
    AppNavbarDetailComponent,
    AppConceptStatsComponent,
    DemografiaTableComponent,
    AppHomeView,
    AppPacientesStatsView
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    FormsModule,
    NgbModule,
    NgSelectModule,
    NgxDaterangepickerMd.forRoot(),
    RouterModule.forRoot([
      { path: 'concept/:id/detail', component: AppConceptDetailView },
      { path: 'concept/:id/pacientes', component: AppPacientesStatsView },
      { path: 'home', component: AppHomeView },
      { path: '**', redirectTo: '/home' }

    ], { initialNavigation: 'enabled' }),
    UiModule,
    SnomedModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
