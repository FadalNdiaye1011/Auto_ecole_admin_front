import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { notRetainAuthGuard } from './not-retain-auth.guard';

describe('notRetainAuthGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => notRetainAuthGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
