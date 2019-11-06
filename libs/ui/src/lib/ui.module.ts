import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from './navbar/navbar.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UiTextDirective } from './text/text.directive';
import { BadgeComponent } from './badge/badge.component';
import { TableSetComponent } from './table/table.component';

import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    MatTableModule,
    MatSortModule,
    BrowserAnimationsModule
  ],
  declarations: [
    NavBarComponent,
    UiTextDirective,
    BadgeComponent,
    TableSetComponent
  ],
  exports: [
    NavBarComponent,
    UiTextDirective,
    BadgeComponent,
    TableSetComponent
  ]
})
export class UiModule { }
