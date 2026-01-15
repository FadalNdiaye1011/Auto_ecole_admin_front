import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoEcoleComponent } from './auto-ecole.component';

describe('AutoEcoleComponent', () => {
  let component: AutoEcoleComponent;
  let fixture: ComponentFixture<AutoEcoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoEcoleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutoEcoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
