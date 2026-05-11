import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GerenciarReservasComponent } from './gerenciar-reservas.component';

describe('GerenciarReservasComponent', () => {
  let component: GerenciarReservasComponent;
  let fixture: ComponentFixture<GerenciarReservasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GerenciarReservasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GerenciarReservasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
