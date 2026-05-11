import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinhasReservasComponent } from './minhas-reservas.component';

describe('MinhasReservasComponent', () => {
  let component: MinhasReservasComponent;
  let fixture: ComponentFixture<MinhasReservasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinhasReservasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MinhasReservasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
