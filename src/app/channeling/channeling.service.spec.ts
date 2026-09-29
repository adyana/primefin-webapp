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

import { ChannelingService } from './channeling.service';

describe('ChannelingService', () => {
  let service: ChannelingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ChannelingService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ChannelingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch partners from the channel registry endpoint', async () => {
    const resultPromise = firstValueFrom(service.getPartners());

    const req = httpMock.expectOne((request) => request.url === '/v2/channel-partners' && request.method === 'GET');
    req.flush([{ id: 1, code: 'acme' }]);

    expect(await resultPromise).toEqual([{ id: 1, code: 'acme' }]);
  });

  it('should create a partner with the registry payload', async () => {
    const payload = { code: 'acme', name: 'Acme', status: 'ACTIVE' };
    const resultPromise = firstValueFrom(service.createPartner(payload));

    const req = httpMock.expectOne((request) => request.url === '/v2/channel-partners' && request.method === 'POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ resourceId: 7 });

    expect(await resultPromise).toEqual({ resourceId: 7 });
  });

  it('should scope product listings by partner', async () => {
    const resultPromise = firstValueFrom(service.getProducts(7));

    const req = httpMock.expectOne(
      (request) =>
        request.url === '/v2/channel-products' && request.method === 'GET' && request.params.get('partnerId') === '7'
    );
    req.flush([]);

    expect(await resultPromise).toEqual([]);
  });

  it('should create rate bands with bps pricing', async () => {
    const payload = { partnerProductId: 9, band: 'B', bps: 150 };
    const resultPromise = firstValueFrom(service.createRateBand(payload));

    const req = httpMock.expectOne((request) => request.url === '/v2/channel-rate-bands' && request.method === 'POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ resourceId: 3 });

    expect(await resultPromise).toEqual({ resourceId: 3 });
  });

  it('should list caps and windows unscoped', async () => {
    const capsPromise = firstValueFrom(service.getCaps());
    const windowsPromise = firstValueFrom(service.getWindows());

    httpMock
      .expectOne((request) => request.url === '/v2/channel-caps' && request.method === 'GET')
      .flush([{ scope: 'GLOBAL' }]);
    httpMock.expectOne((request) => request.url === '/v2/channel-windows' && request.method === 'GET').flush([]);

    expect(await capsPromise).toEqual([{ scope: 'GLOBAL' }]);
    expect(await windowsPromise).toEqual([]);
  });

  it('should delete config rows by id', async () => {
    const results = Promise.all([
      firstValueFrom(service.deleteProduct(9)),
      firstValueFrom(service.deleteRateBand(3)),
      firstValueFrom(service.deleteCap(4)),
      firstValueFrom(service.deleteWindow(5)),
      firstValueFrom(service.deletePartner(7))
    ]);

    for (const [
      url,
      id
    ] of [
      [
        '/v2/channel-products/9',
        9
      ],
      [
        '/v2/channel-rate-bands/3',
        3
      ],
      [
        '/v2/channel-caps/4',
        4
      ],
      [
        '/v2/channel-windows/5',
        5
      ],
      [
        '/v2/channel-partners/7',
        7
      ]
    ] as const) {
      httpMock.expectOne((request) => request.url === url && request.method === 'DELETE').flush({ resourceId: id });
    }

    expect(await results).toEqual([
      { resourceId: 9 },
      { resourceId: 3 },
      { resourceId: 4 },
      { resourceId: 5 },
      { resourceId: 7 }
    ]);
  });
});
