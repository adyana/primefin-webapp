/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { EodService } from './eod.service';

describe('EodService', () => {
  let service: EodService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(EodService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch the EOD status pane', async () => {
    const status = firstValueFrom(service.getStatus());
    httpMock
      .expectOne((request) => request.url === '/v2/eod-status' && request.method === 'GET')
      .flush({ dates: {}, jobs: [], jobCounts: {}, catchUp: {}, modules: {} });

    expect(Object.keys(await status).length).toBe(5);
  });
});
