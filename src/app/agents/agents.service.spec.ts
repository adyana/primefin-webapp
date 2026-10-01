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

import { AgentsService } from './agents.service';

describe('AgentsService', () => {
  let service: AgentsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AgentsService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AgentsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch agents from the registry endpoint', async () => {
    const resultPromise = firstValueFrom(service.getAgents());

    const req = httpMock.expectOne((request) => request.url === '/v2/agents' && request.method === 'GET');
    req.flush([{ id: 1, code: 'AGENT-1' }]);

    expect(await resultPromise).toEqual([{ id: 1, code: 'AGENT-1' }]);
  });

  it('should scope agent listings by status', async () => {
    const resultPromise = firstValueFrom(service.getAgents('ACTIVE'));

    const req = httpMock.expectOne(
      (request) => request.url === '/v2/agents' && request.method === 'GET' && request.params.get('status') === 'ACTIVE'
    );
    req.flush([]);

    expect(await resultPromise).toEqual([]);
  });

  it('should fetch one agent by id', async () => {
    const resultPromise = firstValueFrom(service.getAgent(7));

    const req = httpMock.expectOne((request) => request.url === '/v2/agents/7' && request.method === 'GET');
    req.flush({ id: 7, code: 'AGENT-7' });

    expect(await resultPromise).toEqual({ id: 7, code: 'AGENT-7' });
  });

  it('should create an agent with the registry payload', async () => {
    const payload = { idempotencyKey: 'k-1', code: 'AGENT-1', name: 'Agent 1', commissionBps: 150 };
    const resultPromise = firstValueFrom(service.createAgent(payload));

    const req = httpMock.expectOne((request) => request.url === '/v2/agents' && request.method === 'POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ resourceId: 7 });

    expect(await resultPromise).toEqual({ resourceId: 7 });
  });

  it('should top up agent float with an idempotent payload', async () => {
    const payload = { idempotencyKey: 't-1', amount: 500000, currency: 'IDR', rail: 'ICT' };
    const resultPromise = firstValueFrom(service.topUpAgent(7, payload));

    const req = httpMock.expectOne((request) => request.url === '/v2/agents/7/topup' && request.method === 'POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ resourceId: 7 });

    expect(await resultPromise).toEqual({ resourceId: 7 });
  });

  it('should suspend and close agents by id', async () => {
    const suspendPromise = firstValueFrom(service.suspendAgent(7, { reason: 'audit' }));
    const suspendReq = httpMock.expectOne(
      (request) => request.url === '/v2/agents/7/suspend' && request.method === 'POST'
    );
    suspendReq.flush({ resourceId: 7 });
    expect(await suspendPromise).toEqual({ resourceId: 7 });

    const closePromise = firstValueFrom(service.closeAgent(7, {}));
    const closeReq = httpMock.expectOne((request) => request.url === '/v2/agents/7/close' && request.method === 'POST');
    closeReq.flush({ resourceId: 7 });
    expect(await closePromise).toEqual({ resourceId: 7 });
  });

  it('should list transactions scoped by type and commissions unscoped', async () => {
    const txnsPromise = firstValueFrom(service.getTransactions(7, 'TOP_UP'));
    const txnsReq = httpMock.expectOne(
      (request) =>
        request.url === '/v2/agents/7/transactions' &&
        request.method === 'GET' &&
        request.params.get('type') === 'TOP_UP'
    );
    txnsReq.flush([]);
    expect(await txnsPromise).toEqual([]);

    const commissionsPromise = firstValueFrom(service.getCommissions(7));
    const commissionsReq = httpMock.expectOne(
      (request) => request.url === '/v2/agents/7/commissions' && request.method === 'GET'
    );
    commissionsReq.flush([]);
    expect(await commissionsPromise).toEqual([]);
  });
});
