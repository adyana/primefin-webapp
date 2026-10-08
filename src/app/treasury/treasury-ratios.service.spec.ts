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
import { TreasuryRatiosService } from './treasury-ratios.service';

describe('TreasuryRatiosService', () => {
  let service: TreasuryRatiosService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(TreasuryRatiosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should record capital and compute ratios for a period', async () => {
    const recorded = firstValueFrom(service.recordCapital({ period: '202610', modalInti: 5000000000 }));
    httpMock
      .expectOne((request) => request.url === '/v2/treasury-ratios/capital' && request.method === 'POST')
      .flush({ id: 1, period: '202610' });

    const ratios = firstValueFrom(service.getRatios('202610'));
    httpMock
      .expectOne((request) => request.url === '/v2/treasury-ratios/202610' && request.method === 'GET')
      .flush({ period: '202610', carPct: 53759.13, status: 'PASS', exposures: [] });

    expect((await recorded).period).toBe('202610');
    expect((await ratios).status).toBe('PASS');
  });
});
