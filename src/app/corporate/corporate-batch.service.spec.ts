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
import { CorporateBatchService } from './corporate-batch.service';

describe('CorporateBatchService', () => {
  let service: CorporateBatchService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(CorporateBatchService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should manage batches: create, submit, execute', async () => {
    const create = firstValueFrom(service.createBatch({ corporateId: 1, reference: 'B1', rail: 'ICT', items: [] }));
    const createRequest = httpMock.expectOne(
      (request) => request.url === '/v2/corporate-batches' && request.method === 'POST'
    );
    expect(createRequest.request.body.reference).toBe('B1');
    createRequest.flush({ id: 7, status: 'DRAFT' });
    await expect(create).resolves.toEqual({ id: 7, status: 'DRAFT' });

    const submit = firstValueFrom(service.submitBatch(7));
    httpMock
      .expectOne((request) => request.url === '/v2/corporate-batches/7/submit' && request.method === 'POST')
      .flush({ id: 7, status: 'SUBMITTED' });
    await expect(submit).resolves.toEqual({ id: 7, status: 'SUBMITTED' });

    const execute = firstValueFrom(service.executeBatch(7));
    httpMock
      .expectOne((request) => request.url === '/v2/corporate-batches/7/execute' && request.method === 'POST')
      .flush({ id: 7, status: 'COMPLETED' });
    await expect(execute).resolves.toEqual({ id: 7, status: 'COMPLETED' });
  });
});
