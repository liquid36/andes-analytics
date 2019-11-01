import { async, TestBed } from '@angular/core/testing';
import { SnomedModule } from './snomed.module';

describe('SnomedModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SnomedModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(SnomedModule).toBeDefined();
  });
});
