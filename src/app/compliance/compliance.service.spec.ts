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

import { ComplianceService } from './compliance.service';

describe('ComplianceService', () => {
  let service: ComplianceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ComplianceService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ComplianceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should manage lists and entries', async () => {
    const listsPromise = firstValueFrom(service.getLists());
    const createPromise = firstValueFrom(service.createList({ code: 'INTERNAL' }));
    const entriesPromise = firstValueFrom(service.getEntries(1));
    const addPromise = firstValueFrom(service.createEntry(1, { subjectType: 'NAME' }));
    const deletePromise = firstValueFrom(service.deleteEntry(9));

    httpMock
      .expectOne((request) => request.url === '/v2/compliance-lists' && request.method === 'GET')
      .flush([{ id: 1 }]);
    const createReq = httpMock.expectOne(
      (request) => request.url === '/v2/compliance-lists' && request.method === 'POST'
    );
    expect(createReq.request.body).toEqual({ code: 'INTERNAL' });
    createReq.flush({ resourceId: 1 });
    httpMock
      .expectOne((request) => request.url === '/v2/compliance-lists/1/entries' && request.method === 'GET')
      .flush([]);
    const addReq = httpMock.expectOne(
      (request) => request.url === '/v2/compliance-lists/1/entries' && request.method === 'POST'
    );
    expect(addReq.request.body).toEqual({ subjectType: 'NAME' });
    addReq.flush({ resourceId: 9 });
    httpMock
      .expectOne((request) => request.url === '/v2/compliance-lists/entries/9' && request.method === 'DELETE')
      .flush({ resourceId: 9 });

    expect(await listsPromise).toEqual([{ id: 1 }]);
    expect(await createPromise).toEqual({ resourceId: 1 });
    expect(await entriesPromise).toEqual([]);
    expect(await addPromise).toEqual({ resourceId: 9 });
    expect(await deletePromise).toEqual({ resourceId: 9 });
  });

  it('should import rows and manage the allow-list', async () => {
    const importPromise = firstValueFrom(service.importRows(1, { format: 'CSV', content: 'NAME,x,y' }));
    const allowPromise = firstValueFrom(service.createAllow({ subjectType: 'NAME' }));
    const hitsPromise = firstValueFrom(service.getHits());

    const importReq = httpMock.expectOne(
      (request) => request.url === '/v2/compliance-lists/1/import' && request.method === 'POST'
    );
    expect(importReq.request.body).toEqual({ format: 'CSV', content: 'NAME,x,y' });
    importReq.flush({ resourceId: 2 });
    httpMock
      .expectOne((request) => request.url === '/v2/compliance-allow' && request.method === 'POST')
      .flush({ resourceId: 3 });
    httpMock.expectOne((request) => request.url === '/v2/compliance-hits' && request.method === 'GET').flush([]);

    expect(await importPromise).toEqual({ resourceId: 2 });
    expect(await allowPromise).toEqual({ resourceId: 3 });
    expect(await hitsPromise).toEqual([]);
  });

  it('should approve a pending release via the checker step', async () => {
    const resultPromise = firstValueFrom(service.approveAllow(3));

    const req = httpMock.expectOne(
      (request) => request.url === '/v2/compliance-allow/3/approve' && request.method === 'POST'
    );
    req.flush({ resourceId: 3 });

    expect(await resultPromise).toEqual({ resourceId: 3 });
  });

  it('should manage AML rules, cases and reports', async () => {
    const rulesPromise = firstValueFrom(service.getAmlRules());
    const casesPromise = firstValueFrom(service.getAmlCases('OPEN'));
    const proposePromise = firstValueFrom(service.proposeCase(4, 'looks structured'));
    const reportsPromise = firstValueFrom(service.getAmlReports());
    const generatePromise = firstValueFrom(
      service.generateReport({ reportType: 'LTKT', from: '2026-10-01', to: '2026-10-01' })
    );

    httpMock.expectOne((request) => request.url === '/v2/aml-rules' && request.method === 'GET').flush([{ id: 1 }]);
    httpMock
      .expectOne(
        (request) =>
          request.url === '/v2/aml-cases' && request.method === 'GET' && request.params.get('status') === 'OPEN'
      )
      .flush([{ id: 4 }]);
    const proposeReq = httpMock.expectOne(
      (request) => request.url === '/v2/aml-cases/4/propose' && request.method === 'POST'
    );
    expect(proposeReq.request.body).toEqual({ reason: 'looks structured' });
    proposeReq.flush({ resourceId: 4 });
    httpMock.expectOne((request) => request.url === '/v2/aml-reports' && request.method === 'GET').flush([{ id: 5 }]);
    const generateReq = httpMock.expectOne(
      (request) => request.url === '/v2/aml-reports/generate' && request.method === 'POST'
    );
    expect(generateReq.request.body).toEqual({ reportType: 'LTKT', from: '2026-10-01', to: '2026-10-01' });
    generateReq.flush({ resourceId: 5 });

    expect(await rulesPromise).toEqual([{ id: 1 }]);
    expect(await casesPromise).toEqual([{ id: 4 }]);
    expect(await proposePromise).toEqual({ resourceId: 4 });
    expect(await reportsPromise).toEqual([{ id: 5 }]);
    expect(await generatePromise).toEqual({ resourceId: 5 });
  });
});
