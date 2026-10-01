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

import { QrisService } from './qris.service';

describe('QrisService', () => {
  let service: QrisService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        QrisService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(QrisService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch merchants scoped by status', async () => {
    const resultPromise = firstValueFrom(service.getMerchants('ACTIVE'));

    const req = httpMock.expectOne(
      (request) =>
        request.url === '/v2/qris-merchants' && request.method === 'GET' && request.params.get('status') === 'ACTIVE'
    );
    req.flush([{ id: 1, code: 'WARUNG-1' }]);

    expect(await resultPromise).toEqual([{ id: 1, code: 'WARUNG-1' }]);
  });

  it('should create a merchant with the registry payload', async () => {
    const payload = { idempotencyKey: 'k-1', code: 'WARUNG-1', mcc: '5411', segment: 'UMI' };
    const resultPromise = firstValueFrom(service.createMerchant(payload));

    const req = httpMock.expectOne((request) => request.url === '/v2/qris-merchants' && request.method === 'POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ resourceId: 1 });

    expect(await resultPromise).toEqual({ resourceId: 1 });
  });

  it('should issue codes and list them newest first', async () => {
    const issuePromise = firstValueFrom(service.issueCode(1));
    const listPromise = firstValueFrom(service.getCodes(1));

    httpMock
      .expectOne((request) => request.url === '/v2/qris-merchants/1/codes/issue' && request.method === 'POST')
      .flush({ resourceId: 2 });
    httpMock
      .expectOne((request) => request.url === '/v2/qris-merchants/1/codes' && request.method === 'GET')
      .flush([{ id: 2 }]);

    expect(await issuePromise).toEqual({ resourceId: 2 });
    expect(await listPromise).toEqual([{ id: 2 }]);
  });

  it('should book sales and reverse with full MDR unwind', async () => {
    const salePromise = firstValueFrom(service.createSale(1, { idempotencyKey: 's-1', amount: 600000 }));
    const voidPromise = firstValueFrom(service.voidTransaction(9, { idempotencyKey: 'v-1' }));
    const refundPromise = firstValueFrom(service.refundTransaction(9, { idempotencyKey: 'r-1', amount: 100000 }));

    const saleReq = httpMock.expectOne(
      (request) => request.url === '/v2/qris-transactions/merchants/1/sales' && request.method === 'POST'
    );
    expect(saleReq.request.body).toEqual({ idempotencyKey: 's-1', amount: 600000 });
    saleReq.flush({ resourceId: 9 });
    httpMock
      .expectOne((request) => request.url === '/v2/qris-transactions/9/void' && request.method === 'POST')
      .flush({ resourceId: 10 });
    const refundReq = httpMock.expectOne(
      (request) => request.url === '/v2/qris-transactions/9/refund' && request.method === 'POST'
    );
    expect(refundReq.request.body).toEqual({ idempotencyKey: 'r-1', amount: 100000 });
    refundReq.flush({ resourceId: 11 });

    expect(await salePromise).toEqual({ resourceId: 9 });
    expect(await voidPromise).toEqual({ resourceId: 10 });
    expect(await refundPromise).toEqual({ resourceId: 11 });
  });

  it('should manage MDR rules without a deploy', async () => {
    const listPromise = firstValueFrom(service.getMdrRules());
    const updatePromise = firstValueFrom(service.updateMdrRule(3, { marginBps: 10 }));

    httpMock
      .expectOne((request) => request.url === '/v2/qris-mdr-rules' && request.method === 'GET')
      .flush([{ id: 3 }]);
    const updateReq = httpMock.expectOne(
      (request) => request.url === '/v2/qris-mdr-rules/3' && request.method === 'PUT'
    );
    expect(updateReq.request.body).toEqual({ marginBps: 10 });
    updateReq.flush({ id: 3 });

    expect(await listPromise).toEqual([{ id: 3 }]);
    expect(await updatePromise).toEqual({ id: 3 });
  });
});
