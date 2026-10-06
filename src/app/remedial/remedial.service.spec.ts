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
import { RemedialService } from './remedial.service';

describe('RemedialService', () => {
  let service: RemedialService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(RemedialService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should list cases and run the sweep', async () => {
    const list = firstValueFrom(service.getCases('OPEN'));
    const listRequest = httpMock.expectOne(
      (request) => request.url === '/v2/collection-cases' && request.method === 'GET'
    );
    expect(listRequest.request.params.get('status')).toBe('OPEN');
    listRequest.flush([{ id: 1 }]);
    await expect(list).resolves.toEqual([{ id: 1 }]);

    const sweep = firstValueFrom(service.sweepCases());
    httpMock
      .expectOne((request) => request.url === '/v2/collection-cases/sweep' && request.method === 'POST')
      .flush({ opened: 2, escalated: 0, closed: 1 });
    await expect(sweep).resolves.toEqual({ opened: 2, escalated: 0, closed: 1 });
  });

  it('should manage visits and promises', async () => {
    const visit = firstValueFrom(service.recordVisit(3, { agentId: 42, outcome: 'PROMISED' }));
    const visitRequest = httpMock.expectOne(
      (request) => request.url === '/v2/collection-activities/3/visits' && request.method === 'POST'
    );
    expect(visitRequest.request.body.outcome).toBe('PROMISED');
    visitRequest.flush({ id: 9 });
    await expect(visit).resolves.toEqual({ id: 9 });

    const evaluate = firstValueFrom(service.evaluatePtps());
    httpMock
      .expectOne((request) => request.url === '/v2/collection-activities/ptps/evaluate' && request.method === 'POST')
      .flush({ broken: 1 });
    await expect(evaluate).resolves.toEqual({ broken: 1 });
  });

  it('should propose restructures and write off cases', async () => {
    const propose = firstValueFrom(service.proposeRestructure(3, { pojkType: 'RESCHEDULING' }));
    httpMock
      .expectOne((request) => request.url === '/v2/collection-activities/3/restructures' && request.method === 'POST')
      .flush({ id: 13, status: 'PROPOSED' });
    await expect(propose).resolves.toEqual({ id: 13, status: 'PROPOSED' });

    const writeOff = firstValueFrom(service.writeOffCase(3, 'unrecoverable'));
    const writeOffRequest = httpMock.expectOne(
      (request) => request.url === '/v2/collection-cases/3/write-off' && request.method === 'POST'
    );
    expect(writeOffRequest.request.body.reason).toBe('unrecoverable');
    writeOffRequest.flush({ id: 3, status: 'WRITTEN_OFF' });
    await expect(writeOff).resolves.toEqual({ id: 3, status: 'WRITTEN_OFF' });
  });
});
