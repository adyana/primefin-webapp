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
import { CorporateService } from './corporate.service';

describe('CorporateService', () => {
  let service: CorporateService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(CorporateService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should manage the corporate lifecycle', async () => {
    const list = firstValueFrom(service.getCorporates('ACTIVE'));
    const listRequest = httpMock.expectOne((request) => request.url === '/v2/corporates' && request.method === 'GET');
    expect(listRequest.request.params.get('status')).toBe('ACTIVE');
    listRequest.flush([{ id: 1, code: 'ACME' }]);
    await expect(list).resolves.toEqual([{ id: 1, code: 'ACME' }]);

    const create = firstValueFrom(service.createCorporate({ code: 'ACME', name: 'Acme', segment: 'SME' }));
    const createRequest = httpMock.expectOne(
      (request) => request.url === '/v2/corporates' && request.method === 'POST'
    );
    expect(createRequest.request.body.code).toBe('ACME');
    createRequest.flush({ id: 1, status: 'ACTIVE' });
    await expect(create).resolves.toEqual({ id: 1, status: 'ACTIVE' });

    const suspend = firstValueFrom(service.suspendCorporate(1));
    httpMock
      .expectOne((request) => request.url === '/v2/corporates/1/suspend' && request.method === 'POST')
      .flush({ id: 1, status: 'SUSPENDED' });
    await expect(suspend).resolves.toEqual({ id: 1, status: 'SUSPENDED' });
  });
});
