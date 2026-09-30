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
   * @returns DKE file lines for the submitted batch.
   */
  getBatchDke(batchId: number): Observable<any> {
    return this.http.get(`/v2/payment-batches/${batchId}/dke`);
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
}
