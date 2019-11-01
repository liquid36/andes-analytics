import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from './navbar/navbar.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UiTextDirective } from './text/text.directive';
import { BadgeComponent } from './badge/badge.component';

@NgModule({
  imports: [
    CommonModule,
    NgbModule
  ],
  declarations: [
    NavBarComponent,
    UiTextDirective,
    BadgeComponent
  ],
  exports: [
    NavBarComponent,
    UiTextDirective,
    BadgeComponent
  ]
})
export class UiModule { }
