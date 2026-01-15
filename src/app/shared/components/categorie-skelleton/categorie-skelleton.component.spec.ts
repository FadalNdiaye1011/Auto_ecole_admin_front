import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategorieSkelletonComponent } from './categorie-skelleton.component';

describe('CategorieSkelletonComponent', () => {
  let component: CategorieSkelletonComponent;
  let fixture: ComponentFixture<CategorieSkelletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategorieSkelletonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategorieSkelletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
