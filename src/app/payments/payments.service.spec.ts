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

  it('should manage mandates: list, create, collect, suspend, revoke', async () => {
    const listPromise = firstValueFrom(service.getMandates('ACTIVE'));
    const createPromise = firstValueFrom(service.createMandate({ reference: 'M-1' }));
    const collectPromise = firstValueFrom(service.collectMandate(7, 200000));
    const suspendPromise = firstValueFrom(service.suspendMandate(7));
    const revokePromise = firstValueFrom(service.revokeMandate(8));

    httpMock
      .expectOne(
        (request) =>
          request.url === '/v2/payment-mandates' &&
          request.method === 'GET' &&
          request.params.get('status') === 'ACTIVE'
      )
      .flush([{ id: 7 }]);
    const createReq = httpMock.expectOne(
      (request) => request.url === '/v2/payment-mandates' && request.method === 'POST'
    );
    expect(createReq.request.body).toEqual({ reference: 'M-1' });
    createReq.flush({ resourceId: 7 });
    const collectReq = httpMock.expectOne(
      (request) => request.url === '/v2/payment-mandates/7/collect' && request.method === 'POST'
    );
    expect(collectReq.request.body).toEqual({ amount: 200000 });
    collectReq.flush({ resourceId: 9 });
    httpMock
      .expectOne((request) => request.url === '/v2/payment-mandates/7/suspend' && request.method === 'POST')
      .flush({ resourceId: 7 });
    httpMock
      .expectOne((request) => request.url === '/v2/payment-mandates/8/revoke' && request.method === 'POST')
      .flush({ resourceId: 8 });

    expect(await listPromise).toEqual([{ id: 7 }]);
    expect(await createPromise).toEqual({ resourceId: 7 });
    expect(await collectPromise).toEqual({ resourceId: 9 });
    expect(await suspendPromise).toEqual({ resourceId: 7 });
    expect(await revokePromise).toEqual({ resourceId: 8 });
  });

  it('should manage collections: list, create, approve, reject', async () => {
    const listPromise = firstValueFrom(service.getCollections('PENDING'));
    const createPromise = firstValueFrom(service.createCollection({ reference: 'C-1' }));
    const approvePromise = firstValueFrom(service.approveCollection(3, 'EXT-1'));
    const rejectPromise = firstValueFrom(service.rejectCollection(4));

    httpMock
      .expectOne(
        (request) =>
          request.url === '/v2/payment-collections' &&
          request.method === 'GET' &&
          request.params.get('status') === 'PENDING'
      )
      .flush([{ id: 3 }]);
    const createReq = httpMock.expectOne(
      (request) => request.url === '/v2/payment-collections' && request.method === 'POST'
    );
    expect(createReq.request.body).toEqual({ reference: 'C-1' });
    createReq.flush({ resourceId: 3 });
    const approveReq = httpMock.expectOne(
      (request) => request.url === '/v2/payment-collections/3/approve' && request.method === 'POST'
    );
    expect(approveReq.request.body).toEqual({ externalRef: 'EXT-1' });
    approveReq.flush({ resourceId: 11 });
    httpMock
      .expectOne((request) => request.url === '/v2/payment-collections/4/reject' && request.method === 'POST')
      .flush({ resourceId: 4 });

    expect(await listPromise).toEqual([{ id: 3 }]);
    expect(await createPromise).toEqual({ resourceId: 3 });
    expect(await approvePromise).toEqual({ resourceId: 11 });
    expect(await rejectPromise).toEqual({ resourceId: 4 });
  });

  it('should fetch prefund projections per rail', async () => {
    const resultPromise = firstValueFrom(service.getPrefund());

    const req = httpMock.expectOne((request) => request.url === '/v2/payment-prefund' && request.method === 'GET');
    req.flush([{ rail: 'BCT', required: 100, limit: 200, breached: false }]);

    expect(await resultPromise).toEqual([{ rail: 'BCT', required: 100, limit: 200, breached: false }]);
  });

  it('should update rail config without a deploy', async () => {
    const resultPromise = firstValueFrom(service.updateRailConfig('BCT', { prefundLimit: 5000000 }));

    const req = httpMock.expectOne(
      (request) => request.url === '/v2/payment-rails/BCT/config' && request.method === 'PUT'
    );
    expect(req.request.body).toEqual({ prefundLimit: 5000000 });
    req.flush({ code: 'BCT' });

    expect(await resultPromise).toEqual({ code: 'BCT' });
  });

  it('should manage schedules: list, create, update, run, runs', async () => {
    const listPromise = firstValueFrom(service.getSchedules());
    const createPromise = firstValueFrom(service.createSchedule({ code: 'S-1' }));
    const updatePromise = firstValueFrom(service.updateSchedule(5, { enabled: true }));
    const runPromise = firstValueFrom(service.runSchedule(5));
    const runsPromise = firstValueFrom(service.getScheduleRuns(5));

    httpMock
      .expectOne((request) => request.url === '/v2/payment-schedules' && request.method === 'GET')
      .flush([{ id: 5 }]);
    const createReq = httpMock.expectOne(
      (request) => request.url === '/v2/payment-schedules' && request.method === 'POST'
    );
    expect(createReq.request.body).toEqual({ code: 'S-1' });
    createReq.flush({ resourceId: 5 });
    const updateReq = httpMock.expectOne(
      (request) => request.url === '/v2/payment-schedules/5' && request.method === 'PUT'
    );
    expect(updateReq.request.body).toEqual({ enabled: true });
    updateReq.flush({ id: 5 });
    httpMock
      .expectOne((request) => request.url === '/v2/payment-schedules/5/run' && request.method === 'POST')
      .flush({ resourceId: 2 });
    httpMock
      .expectOne((request) => request.url === '/v2/payment-schedules/5/runs' && request.method === 'GET')
      .flush([{ id: 2 }]);

    expect(await listPromise).toEqual([{ id: 5 }]);
    expect(await createPromise).toEqual({ resourceId: 5 });
    expect(await updatePromise).toEqual({ id: 5 });
    expect(await runPromise).toEqual({ resourceId: 2 });
    expect(await runsPromise).toEqual([{ id: 2 }]);
  });
});
