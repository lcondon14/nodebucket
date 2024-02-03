/**
 * Title: security.service.spec.ts
 * Author: Laurel Condon
 * Date: 2 Feb 2024
 */

import { TestBed } from '@angular/core/testing';

import { SecurityService } from './security.service';

describe('SecurityService', () => {
  let service: SecurityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SecurityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
