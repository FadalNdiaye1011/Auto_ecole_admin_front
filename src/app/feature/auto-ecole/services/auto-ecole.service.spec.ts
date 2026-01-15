import { TestBed } from '@angular/core/testing';

import { AutoEcoleService } from './auto-ecole.service';

describe('AutoEcoleService', () => {
  let service: AutoEcoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AutoEcoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
