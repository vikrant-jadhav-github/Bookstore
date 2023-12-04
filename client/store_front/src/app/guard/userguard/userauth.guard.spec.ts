import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { userauthGuard } from './userauth.guard';

describe('userauthGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => userauthGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
