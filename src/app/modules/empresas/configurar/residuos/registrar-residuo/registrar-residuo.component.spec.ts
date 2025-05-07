import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarResiduoComponent } from './registrar-residuo.component';

describe('RegistrarResiduoComponent', () => {
  let component: RegistrarResiduoComponent;
  let fixture: ComponentFixture<RegistrarResiduoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarResiduoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarResiduoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
