/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Corporate batch service: bulk disbursement batches with validated
 * items, prefund-checked submit and idempotent execution.
 */
@Injectable({ providedIn: 'root' })
export class CorporateBatchService {
  private http = inject(HttpClient);

  /**
   * @param status Batch status filter (optional; all when omitted).
   * @returns Batches, newest first.
   */
  getBatches(status?: string): Observable<any> {
    const params: Record<string, string> = {};
    if (status) {
      params['status'] = status;
    }
    return this.http.get('/v2/corporate-batches', { params });
  }

  /**
   * @returns One batch.
   */
  getBatch(batchId: number): Observable<any> {
    return this.http.get(`/v2/corporate-batches/${batchId}`);
  }

  /**
   * @returns Items of a batch in line order.
   */
  getItems(batchId: number): Observable<any> {
    return this.http.get(`/v2/corporate-batches/${batchId}/items`);
  }

  /**
   * @param batch Batch payload (corporateId, reference, rail, currency, valueDate, items).
   * @returns Created DRAFT batch (bad lines quarantined with reasons).
   */
  createBatch(batch: any): Observable<any> {
    return this.http.post('/v2/corporate-batches', batch);
  }

  /**
   * @returns SUBMITTED batch (locks the set behind the prefund check).
   */
  submitBatch(batchId: number): Observable<any> {
    return this.http.post(`/v2/corporate-batches/${batchId}/submit`, {});
  }

  /**
   * @returns EXECUTING then COMPLETED/FAILED batch (one transfer order per item).
   */
  executeBatch(batchId: number): Observable<any> {
    return this.http.post(`/v2/corporate-batches/${batchId}/execute`, {});
  }

  /**
   * @returns Approval tiers by min amount.
   */
  getTiers(): Observable<any> {
    return this.http.get('/v2/corporate-approvals/tiers');
  }

  /**
   * @param tier Tier payload (minAmount, maxAmount, requiredPermission).
   * @returns Created tier.
   */
  createTier(tier: any): Observable<any> {
    return this.http.post('/v2/corporate-approvals/tiers', tier);
  }

  /**
   * @returns APPROVED batch (below-tier auto-passes, otherwise tier permission + maker≠checker).
   */
  approveBatch(batchId: number): Observable<any> {
    return this.http.post(`/v2/corporate-approvals/batches/${batchId}/approve`, {});
  }

  /**
   * @returns REJECTED batch.
   */
  rejectBatch(batchId: number): Observable<any> {
    return this.http.post(`/v2/corporate-approvals/batches/${batchId}/reject`, {});
  }

  /**
   * @returns Roster lines for a corporate.
   */
  getRoster(corporateId: number): Observable<any> {
    return this.http.get(`/v2/corporate-payroll/corporates/${corporateId}/roster`);
  }

  /**
   * @param employee Employee payload (employeeRef, account, bank, name, amount).
   * @returns Created roster line.
   */
  addEmployee(corporateId: number, employee: any): Observable<any> {
    return this.http.post(`/v2/corporate-payroll/corporates/${corporateId}/roster`, employee);
  }

  /**
   * @returns Roster line with flipped active flag.
   */
  setEmployeeActive(rosterId: number, active: boolean): Observable<any> {
    return this.http.post(`/v2/corporate-payroll/roster/${rosterId}/${active ? 'activate' : 'deactivate'}`, {});
  }

  /**
   * @param salary Salary payload (period YYYYMM, rail).
   * @returns Created DRAFT SALARY batch (duplicate periods rejected).
   */
  createSalaryBatch(corporateId: number, salary: any): Observable<any> {
    return this.http.post(`/v2/corporate-payroll/corporates/${corporateId}/salary`, salary);
  }

  /**
   * @returns Schedule run counts (created, skipped).
   */
  runPayrollSchedules(): Observable<any> {
    return this.http.post('/v2/corporate-payroll/run', {});
  }
}
