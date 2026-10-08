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
import { TreasuryNostroService } from './treasury-nostro.service';

describe('TreasuryNostroService', () => {
  let service: TreasuryNostroService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(TreasuryNostroService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should import statements and filter nostro breaks', async () => {
    const imported = firstValueFrom(
      service.importStatement(':20:X\n:25:A\n:60F:C261001IDR0,00\n:61:2610021002C1,00,NTRFR\n:62F:C261002IDR1,00')
    );
    httpMock
      .expectOne((request) => request.url === '/v2/treasury-nostro/import' && request.method === 'POST')
      .flush({ statementId: 1, matched: 0, breaks: 1 });
    await expect(imported).resolves.toEqual({ statementId: 1, matched: 0, breaks: 1 });

    const breaks = firstValueFrom(service.getNostroBreaks());
    const breaksRequest = httpMock.expectOne(
      (request) => request.url === '/v2/payment-breaks' && request.method === 'GET'
    );
    expect(breaksRequest.request.params.get('status')).toBe('OPEN');
    breaksRequest.flush([
      { id: 1, reason: 'NOSTRO_LINE:9 C 1' },
      { id: 2, reason: 'LATE_ORDER ref X' }
    ]);
    await expect(breaks).resolves.toEqual([{ id: 1, reason: 'NOSTRO_LINE:9 C 1' }]);
  });
});
