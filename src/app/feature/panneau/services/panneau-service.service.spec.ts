import { TestBed } from '@angular/core/testing';

import { PanneauService } from './panneau.service';

describe('PanneauServiceService', () => {
  let service: PanneauService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PanneauService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
