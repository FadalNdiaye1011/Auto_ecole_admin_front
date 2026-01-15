import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanneauComponent } from './panneau.component';

describe('PanneauComponent', () => {
  let component: PanneauComponent;
  let fixture: ComponentFixture<PanneauComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanneauComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanneauComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
