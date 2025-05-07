import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResiduosComponent } from './residuos.component';

describe('ResiduosComponent', () => {
  let component: ResiduosComponent;
  let fixture: ComponentFixture<ResiduosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResiduosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResiduosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
