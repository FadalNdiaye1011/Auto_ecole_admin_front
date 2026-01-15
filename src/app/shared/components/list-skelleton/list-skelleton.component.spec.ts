import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSkelletonComponent } from './list-skelleton.component';

describe('ListSkelletonComponent', () => {
  let component: ListSkelletonComponent;
  let fixture: ComponentFixture<ListSkelletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListSkelletonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListSkelletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
