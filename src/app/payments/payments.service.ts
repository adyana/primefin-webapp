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
 * Payments service: ID payment rails (ICT/BCT/SKNBI/RTGS) operations.
 * Served by the fineract-payments-id module under /api/v2/payment-* (PrimeFin P0-P4).
 */
@Injectable({
  providedIn: 'root'
})
export class PaymentsService {
  private http = inject(HttpClient);

  /**
   * @returns All seeded payment rails with ticket ranges and windows.
   */
  getRails(): Observable<any> {
    return this.http.get('/v2/payment-rails');
  }

  /**
   * @param date Business date YYYY-MM-DD (defaults to today server-side).
   * @returns Per-rail counts/values plus RTGS queue depth and open breaks.
   */
  getThroughput(date?: string): Observable<any> {
    let params = new HttpParams();
    if (date !== undefined) {
      params = params.set('date', date);
    }
    return this.http.get('/v2/payment-reports/throughput', { params });
  }

  /**
   * @param from ISO datetime start.
   * @param to ISO datetime end.
   * @param granularity DAY, MONTH or YEAR.
   * @returns Per-rail traffic series for the dashboard chart.
   */
  getTraffic(from: string, to: string, granularity: string): Observable<any> {
    const params = new HttpParams().set('from', from).set('to', to).set('granularity', granularity);
    return this.http.get('/v2/payment-reports/traffic', { params });
  }

  /**
   * @param status Order status filter (optional; all orders when omitted).
   * @returns Transfer orders, newest last.
   */
  getOrders(status?: string): Observable<any> {
    let params = new HttpParams();
    if (status !== undefined) {
      params = params.set('status', status);
    }
    return this.http.get('/v2/payment-orders', { params });
  }

  /**
   * @param status Break status filter (optional; all breaks when omitted).
   * @returns Reconciliation breaks.
   */
  getBreaks(status?: string): Observable<any> {
    let params = new HttpParams();
    if (status !== undefined) {
      params = params.set('status', status);
    }
    return this.http.get('/v2/payment-breaks', { params });
  }

  /**
   * Human close of an OPEN break (never automatic).
   * @param breakId Break id.
   * @returns Close result.
   */
  closeBreak(breakId: number): Observable<any> {
    return this.http.post(`/v2/payment-breaks/${breakId}/close`, {});
  }

  /**
   * @returns Fraud holds older than the 24h reporting SLA.
   */
  getFraudSla(): Observable<any> {
    return this.http.get('/v2/payment-reports/fraud-sla');
  }

  /**
   * Opens one recon break per breached hold (idempotent).
   * @returns Counts {breached, opened}.
   */
  sweepFraudSla(): Observable<any> {
    return this.http.post('/v2/payment-reports/fraud-sla/sweep', {});
  }

  /**
   * @returns Transfer batches (optional status filter).
   */
  getBatches(status?: string): Observable<any> {
    let params = new HttpParams();
    if (status !== undefined) {
      params = params.set('status', status);
    }
    return this.http.get('/v2/payment-batches', { params });
  }

  /**
   * @param batchId Batch id.
   * @returns Batch detail with members.
   */
  getBatch(batchId: number): Observable<any> {
    return this.http.get(`/v2/payment-batches/${batchId}`);
  }

  /**
   * @param batchId Batch id.
   * @returns Batch member orders.
   */
  getBatchMembers(batchId: number): Observable<any> {
    return this.http.get(`/v2/payment-batches/${batchId}/members`);
  }

  /**
   * @param batchId Batch id.
   * @returns DKE file content for the submitted batch (plain text).
   */
  getBatchDke(batchId: number): Observable<any> {
    return this.http.get(`/v2/payment-batches/${batchId}/dke`, { responseType: 'text' });
  }

  /**
   * @param batchId Batch id.
   * @returns Batch send result (members SENT).
   */
  sendBatch(batchId: number): Observable<any> {
    return this.http.post(`/v2/payment-batches/${batchId}/send`, {});
  }

  /**
   * @param batchId Batch id.
   * @param rows Return rows [{ref, status, reason}].
   * @returns Returns filing result.
   */
  fileBatchReturns(batchId: number, rows: any[]): Observable<any> {
    return this.http.post(`/v2/payment-batches/${batchId}/returns`, { rows });
  }

  /**
   * @returns Per-rail prefund projections (required vs limit with breach flag).
   */
  getPrefund(): Observable<any> {
    return this.http.get('/v2/payment-prefund');
  }

  /**
   * @param code Rail code.
   * @param config Rail config (ticketMin, ticketMax, cutoffStart, cutoffEnd, timezone, prefundLimit).
   * @returns Updated rail.
   */
  updateRailConfig(code: string, config: any): Observable<any> {
    return this.http.put(`/v2/payment-rails/${code}/config`, config);
  }

  /**
   * @param status Mandate status filter (optional; all mandates when omitted).
   * @returns DDT autopay mandates.
   */
  getMandates(status?: string): Observable<any> {
    let params = new HttpParams();
    if (status !== undefined) {
      params = params.set('status', status);
    }
    return this.http.get('/v2/payment-mandates', { params });
  }

  /**
   * @param mandate Mandate payload (reference, debtorAccount, creditorAccount, maxAmount, currency, frequency, nextDueOn).
   * @returns Creation result with resourceId.
   */
  createMandate(mandate: any): Observable<any> {
    return this.http.post('/v2/payment-mandates', mandate);
  }

  /**
   * @param mandateId Mandate id.
   * @param amount Collection amount (within mandate max).
   * @returns Collection result with the booked order id.
   */
  collectMandate(mandateId: number, amount: number): Observable<any> {
    return this.http.post(`/v2/payment-mandates/${mandateId}/collect`, { amount });
  }

  /**
   * @param mandateId Mandate id.
   * @returns Suspension result.
   */
  suspendMandate(mandateId: number): Observable<any> {
    return this.http.post(`/v2/payment-mandates/${mandateId}/suspend`, {});
  }

  /**
   * @param mandateId Mandate id.
   * @returns Revocation result.
   */
  revokeMandate(mandateId: number): Observable<any> {
    return this.http.post(`/v2/payment-mandates/${mandateId}/revoke`, {});
  }

  /**
   * @param status Collection status filter (optional; all requests when omitted).
   * @returns Collection requests.
   */
  getCollections(status?: string): Observable<any> {
    let params = new HttpParams();
    if (status !== undefined) {
      params = params.set('status', status);
    }
    return this.http.get('/v2/payment-collections', { params });
  }

  /**
   * @param collection Collection payload (reference, creditorAccount, debtorAccount, debtorName, amount, currency, expiresOn).
   * @returns Creation result with resourceId.
   */
  createCollection(collection: any): Observable<any> {
    return this.http.post('/v2/payment-collections', collection);
  }

  /**
   * @param requestId Collection request id.
   * @param externalRef Debtor approval reference.
   * @returns Approval result with the booked order id.
   */
  approveCollection(requestId: number, externalRef: string): Observable<any> {
    return this.http.post(`/v2/payment-collections/${requestId}/approve`, { externalRef });
  }

  /**
   * @param requestId Collection request id.
   * @returns Rejection result.
   */
  rejectCollection(requestId: number): Observable<any> {
    return this.http.post(`/v2/payment-collections/${requestId}/reject`, {});
  }

  /**
   * @returns Automation schedules.
   */
  getSchedules(): Observable<any> {
    return this.http.get('/v2/payment-schedules');
  }

  /**
   * @param schedule Schedule payload (code, action, rail, amountOverride, enabled, intervalMinutes).
   * @returns Creation result with resourceId.
   */
  createSchedule(schedule: any): Observable<any> {
    return this.http.post('/v2/payment-schedules', schedule);
  }

  /**
   * @param scheduleId Schedule id.
   * @param schedule Schedule payload (rail, amountOverride, enabled, intervalMinutes).
   * @returns Updated schedule.
   */
  updateSchedule(scheduleId: number, schedule: any): Observable<any> {
    return this.http.put(`/v2/payment-schedules/${scheduleId}`, schedule);
  }

  /**
   * @param scheduleId Schedule id.
   * @returns Immediate execution result with the run id.
   */
  runSchedule(scheduleId: number): Observable<any> {
    return this.http.post(`/v2/payment-schedules/${scheduleId}/run`, {});
  }

  /**
   * @param scheduleId Schedule id.
   * @returns Schedule runs, newest first.
   */
  getScheduleRuns(scheduleId: number): Observable<any> {
    return this.http.get(`/v2/payment-schedules/${scheduleId}/runs`);
  }
}
