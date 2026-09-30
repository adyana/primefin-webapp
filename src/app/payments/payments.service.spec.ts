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

import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PaymentsService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(PaymentsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch rails from the payment registry endpoint', async () => {
    const resultPromise = firstValueFrom(service.getRails());

    const req = httpMock.expectOne((request) => request.url === '/v2/payment-rails' && request.method === 'GET');
    req.flush([{ code: 'ICT' }]);

    expect(await resultPromise).toEqual([{ code: 'ICT' }]);
  });

  it('should scope throughput by business date', async () => {
    const resultPromise = firstValueFrom(service.getThroughput('2026-09-30'));

    const req = httpMock.expectOne(
      (request) =>
        request.url === '/v2/payment-reports/throughput' &&
        request.method === 'GET' &&
        request.params.get('date') === '2026-09-30'
    );
    req.flush({ businessDate: '2026-09-30' });

    expect(await resultPromise).toEqual({ businessDate: '2026-09-30' });
  });

  it('should list breaks scoped by status and close them by id', async () => {
    const listPromise = firstValueFrom(service.getBreaks('OPEN'));
    const closePromise = firstValueFrom(service.closeBreak(4));

    httpMock
      .expectOne(
        (request) =>
          request.url === '/v2/payment-breaks' && request.method === 'GET' && request.params.get('status') === 'OPEN'
      )
      .flush([{ id: 4 }]);
    httpMock
      .expectOne((request) => request.url === '/v2/payment-breaks/4/close' && request.method === 'POST')
      .flush({ resourceId: 4 });

    expect(await listPromise).toEqual([{ id: 4 }]);
    expect(await closePromise).toEqual({ resourceId: 4 });
  });

  it('should sweep the fraud SLA with an empty post', async () => {
    const resultPromise = firstValueFrom(service.sweepFraudSla());

    const req = httpMock.expectOne(
      (request) => request.url === '/v2/payment-reports/fraud-sla/sweep' && request.method === 'POST'
    );
    expect(req.request.body).toEqual({});
    req.flush({ resourceId: 1 });

    expect(await resultPromise).toEqual({ resourceId: 1 });
  });
});
