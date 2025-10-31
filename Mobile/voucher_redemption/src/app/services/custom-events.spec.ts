import { TestBed } from '@angular/core/testing';

import { CustomEvents } from './custom-events';

describe('CustomEvents', () => {
  let service: CustomEvents;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomEvents);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
