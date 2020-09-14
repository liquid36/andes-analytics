import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { AgmCoreModule } from '@agm/core';

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
import { AppOrganizacionesStatsView } from './views/organizaciones-stats/organizaciones-stats.view';
import { AppProfesionalesStatsView } from './views/profesionales-stats/profesionales-stats.view';
import { AppPrestacionesStatsView } from './views/prestaciones-stats/prestaciones-stats.view';
import { AppConceptosAsociadosStatsView } from './views/conceptos-asociados-stats/conceptos-asociados-stats.view';
import { AppMapsStatsView } from './views/maps-stats/maps-stats.view';
import { AppBubbleChartsView } from './views/conceptos-asociados-stats/bubble-charts/bubble-charts.component';
import { AppSandDanceView } from './views/sanddance-view/sanddance-view.view';
import { AuthView } from './auth/auth.view';
import { MainView } from './views/main/main.view';
import { UnauthorizedView } from './auth/unauthorized.view';
import { RoutingGuard } from './services/app-routing.guard';
import { NombreFiltrosPipe } from './pipes/nombre-filtros.pipes';
import { AppLocalidadesStatsView } from './views/localidades-stats/localidades-stats.view';

// import * as PlotlyJS from 'plotly.js/dist/plotly.js';
import { PlotlyModule, PlotlyViaWindowModule } from 'angular-plotly.js';
import { AppGrafoView } from './views/grafo-view/grafo.view';
import { environment } from '../environments/environment';
// PlotlyModule.plotlyjs = PlotlyJS;


@NgModule({
  declarations: [
    AppComponent,
    SnomedSearchComponent,
    ConceptCountPillComponent,
    ConceptDefinitionStatusIconComponent,
    AppQueryOptionsComponent,
    AppNavbarDetailComponent,
    AppConceptStatsComponent,
    DemografiaTableComponent,
    AppBubbleChartsView,
    AppHomeView,
    AppConceptDetailView,
    AppPacientesStatsView,
    AppOrganizacionesStatsView,
    AppProfesionalesStatsView,
    AppPrestacionesStatsView,
    AppConceptosAsociadosStatsView,
    AppLocalidadesStatsView,
    AppMapsStatsView,
    AppSandDanceView,
    AppGrafoView,
    AuthView,
    MainView,
    UnauthorizedView,
    NombreFiltrosPipe,
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    FormsModule,
    NgbModule,
    NgSelectModule,
    NgxDaterangepickerMd.forRoot(),
    AgmCoreModule.forRoot({
      apiKey: environment.GOOGLEMAPS_KEY,
      libraries: ['visualization']
    }),
    PlotlyViaWindowModule,
    RouterModule.forRoot([
      {
        path: '',
        component: MainView,
        canActivate: [RoutingGuard],
        children: [
          { path: 'concept/:id/detail', component: AppConceptDetailView },
          { path: 'concept/:id/pacientes', component: AppPacientesStatsView },
          { path: 'concept/:id/localidades', component: AppLocalidadesStatsView },
          { path: 'concept/:id/organizaciones', component: AppOrganizacionesStatsView },
          { path: 'concept/:id/profesionales', component: AppProfesionalesStatsView },
          { path: 'concept/:id/prestaciones', component: AppPrestacionesStatsView },
          { path: 'concept/:id/asociados', component: AppConceptosAsociadosStatsView },
          { path: 'concept/:id/mapa', component: AppMapsStatsView },
          { path: 'concept/:id/bi', component: AppSandDanceView },
          { path: 'concept/:id/grafo', component: AppGrafoView },
          { path: 'home', component: AppHomeView },

        ]
      },
      { path: 'auth/login', component: AuthView },
      { path: 'unauthorized', component: UnauthorizedView },
      { path: '**', redirectTo: '/home' }

    ], { initialNavigation: 'enabled' }),
    UiModule,
    SnomedModule.forRoot(environment.API_URL)
  ],
  providers: [
    RoutingGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
