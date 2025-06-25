import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManejoResiduosComponent } from './manejo-residuos.component';

describe('ManejoResiduosComponent', () => {
  let component: ManejoResiduosComponent;
  let fixture: ComponentFixture<ManejoResiduosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManejoResiduosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManejoResiduosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
