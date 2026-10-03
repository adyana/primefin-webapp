/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

/** Custom Services */
import { OnboardingService } from './onboarding.service';

describe('OnboardingService', () => {
  let service: OnboardingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(OnboardingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should list the approval queue', async () => {
    const listPromise = firstValueFrom(service.listApplications('APPROVAL'));

    httpMock
      .expectOne((request) => request.url === '/v2/credit-applications?stage=APPROVAL' && request.method === 'GET')
      .flush({ totalFilteredRecords: 1, pageItems: [{ id: 7 }] });

    expect(await listPromise).toEqual({ totalFilteredRecords: 1, pageItems: [{ id: 7 }] });
  });

  it('should drive the pipeline actions', async () => {
    const advancePromise = firstValueFrom(service.advance(7, 'ok'));
    const scorePromise = firstValueFrom(service.score(7));
    const approvePromise = firstValueFrom(service.approve(7, 'ok'));
    const disbursePromise = firstValueFrom(service.disburse(7, 'ok'));
    const bookPromise = firstValueFrom(service.book(7));

    httpMock
      .expectOne((request) => request.url === '/v2/credit-applications/7/advance' && request.method === 'POST')
      .flush({ resourceId: 7 });
    httpMock
      .expectOne((request) => request.url === '/v2/credit-applications/7/score' && request.method === 'POST')
      .flush({ resourceId: 7 });
    httpMock
      .expectOne((request) => request.url === '/v2/credit-applications/7/approve' && request.method === 'POST')
      .flush({ resourceId: 7 });
    httpMock
      .expectOne((request) => request.url === '/v2/credit-applications/7/disburse' && request.method === 'POST')
      .flush({ resourceId: 7 });
    httpMock
      .expectOne((request) => request.url === '/v2/credit-applications/7/book' && request.method === 'POST')
      .flush({ resourceId: 7 });

    expect(await advancePromise).toEqual({ resourceId: 7 });
    expect(await scorePromise).toEqual({ resourceId: 7 });
    expect(await approvePromise).toEqual({ resourceId: 7 });
    expect(await disbursePromise).toEqual({ resourceId: 7 });
    expect(await bookPromise).toEqual({ resourceId: 7 });
  });
});
