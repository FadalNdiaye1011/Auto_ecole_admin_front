import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormTestExamenSkelletonComponent } from './form-test-examen-skelleton.component';

describe('FormTestExamenSkelletonComponent', () => {
  let component: FormTestExamenSkelletonComponent;
  let fixture: ComponentFixture<FormTestExamenSkelletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormTestExamenSkelletonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormTestExamenSkelletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
