import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConceptDescTableComponent } from './concept-desc-table/concept-desc-table.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    ConceptDescTableComponent,
  ],
  exports: [
    ConceptDescTableComponent,
  ]

})
export class SnomedModule { }
