/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Agents service: branchless agent registry + float lifecycle.
 * Served by the fineract-agent module under /api/v2/agents (PrimeFin AB).
 */
@Injectable({
  providedIn: 'root'
})
export class AgentsService {
  private http = inject(HttpClient);

  /**
   * @param status Agent status filter (optional; all agents when omitted).
   * @returns All registered agents.
   */
  getAgents(status?: string): Observable<any> {
    let params = new HttpParams();
    if (status !== undefined) {
      params = params.set('status', status);
    }
    return this.http.get('/v2/agents', { params });
  }

  /**
   * @param agentId Agent id.
   * @returns One agent with float balance.
   */
  getAgent(agentId: number): Observable<any> {
    return this.http.get(`/v2/agents/${agentId}`);
  }

  /**
   * @param agent Agent payload (idempotencyKey, code, name, location, commissionBps, status).
   * @returns Creation result with resourceId.
   */
  createAgent(agent: any): Observable<any> {
    return this.http.post('/v2/agents', agent);
  }

  /**
   * @param agentId Agent id.
   * @param agent Agent payload (name, location, commissionBps, status).
   * @returns Updated agent.
   */
  updateAgent(agentId: number, agent: any): Observable<any> {
    return this.http.put(`/v2/agents/${agentId}`, agent);
  }

  /**
   * @param agentId Agent id.
   * @param topUp Top-up payload (idempotencyKey, amount, currency, rail).
   * @returns Top-up result with resourceId.
   */
  topUpAgent(agentId: number, topUp: any): Observable<any> {
    return this.http.post(`/v2/agents/${agentId}/topup`, topUp);
  }

  /**
   * @param agentId Agent id.
   * @param action Action payload (reason, optional).
   * @returns Suspension result with resourceId.
   */
  suspendAgent(agentId: number, action: any): Observable<any> {
    return this.http.post(`/v2/agents/${agentId}/suspend`, action);
  }

  /**
   * @param agentId Agent id.
   * @param action Action payload (reason, optional).
   * @returns Close result with resourceId.
   */
  closeAgent(agentId: number, action: any): Observable<any> {
    return this.http.post(`/v2/agents/${agentId}/close`, action);
  }

  /**
   * @param agentId Agent id.
   * @param type Transaction type filter (optional; all types when omitted).
   * @returns Agent transactions, newest first.
   */
  getTransactions(agentId: number, type?: string): Observable<any> {
    let params = new HttpParams();
    if (type !== undefined) {
      params = params.set('type', type);
    }
    return this.http.get(`/v2/agents/${agentId}/transactions`, { params });
  }

  /**
   * @param agentId Agent id.
   * @returns Agent commissions, newest first.
   */
  getCommissions(agentId: number): Observable<any> {
    return this.http.get(`/v2/agents/${agentId}/commissions`);
  }
}
