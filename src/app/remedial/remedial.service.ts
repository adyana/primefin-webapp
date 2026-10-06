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
 * Collections workbench service: remedial case queue, visits, promises
 * to pay, POJK restructurings and write-off proposals.
 */
@Injectable({ providedIn: 'root' })
export class RemedialService {
  private http = inject(HttpClient);

  /**
   * @param status Case status filter (optional; all cases when omitted).
   * @returns Collection cases, newest first.
   */
  getCases(status?: string): Observable<any> {
    const params: Record<string, string> = {};
    if (status) {
      params['status'] = status;
    }
    return this.http.get('/v2/collection-cases', { params });
  }

  /**
   * @returns One collection case.
   */
  getCase(caseId: number): Observable<any> {
    return this.http.get(`/v2/collection-cases/${caseId}`);
  }

  /**
   * @returns Sweep counts (opened, escalated, closed).
   */
  sweepCases(): Observable<any> {
    return this.http.post('/v2/collection-cases/sweep', {});
  }

  /**
   * @param agentId ACTIVE agent id.
   * @returns Updated case.
   */
  assignCase(caseId: number, agentId: number): Observable<any> {
    return this.http.post(`/v2/collection-cases/${caseId}/assign`, { agentId });
  }

  /**
   * @returns Case escalated to LEGAL.
   */
  escalateToLegal(caseId: number): Observable<any> {
    return this.http.post(`/v2/collection-cases/${caseId}/legal`, {});
  }

  /**
   * @param status RECOVERED or CLOSED.
   * @returns Updated case.
   */
  closeCase(caseId: number, status: string): Observable<any> {
    return this.http.post(`/v2/collection-cases/${caseId}/close`, { status });
  }

  /**
   * @param reason Write-off reason (required).
   * @returns Updated case (WRITTEN_OFF, or OPEN with a held command).
   */
  writeOffCase(caseId: number, reason: string): Observable<any> {
    return this.http.post(`/v2/collection-cases/${caseId}/write-off`, { reason });
  }

  /**
   * @returns Visit attempts for a case, newest first.
   */
  getVisits(caseId: number): Observable<any> {
    return this.http.get(`/v2/collection-activities/${caseId}/visits`);
  }

  /**
   * @param visit Visit payload (agentId, scheduledOn, visitedOn, outcome, notes).
   * @returns Recorded visit.
   */
  recordVisit(caseId: number, visit: any): Observable<any> {
    return this.http.post(`/v2/collection-activities/${caseId}/visits`, visit);
  }

  /**
   * @returns Promises to pay for a case, newest first.
   */
  getPtps(caseId: number): Observable<any> {
    return this.http.get(`/v2/collection-activities/${caseId}/ptps`);
  }

  /**
   * @param promise Promise payload (promisedOn, amount).
   * @returns Created PENDING promise.
   */
  createPtp(caseId: number, promise: any): Observable<any> {
    return this.http.post(`/v2/collection-activities/${caseId}/ptps`, promise);
  }

  /**
   * @returns Promise marked KEPT.
   */
  markPtpKept(ptpId: number): Observable<any> {
    return this.http.post(`/v2/collection-activities/ptps/${ptpId}/kept`, {});
  }

  /**
   * @returns Promise marked CANCELLED.
   */
  cancelPtp(ptpId: number): Observable<any> {
    return this.http.post(`/v2/collection-activities/ptps/${ptpId}/cancel`, {});
  }

  /**
   * @returns Count of promises flipped BROKEN.
   */
  evaluatePtps(): Observable<any> {
    return this.http.post('/v2/collection-activities/ptps/evaluate', {});
  }

  /**
   * @returns Restructuring wrappers for a case.
   */
  getRestructures(caseId: number): Observable<any> {
    return this.http.get(`/v2/collection-activities/${caseId}/restructures`);
  }

  /**
   * @param proposal Proposal payload (pojkType, rescheduleJson).
   * @returns Created PROPOSED wrapper.
   */
  proposeRestructure(caseId: number, proposal: any): Observable<any> {
    return this.http.post(`/v2/collection-activities/${caseId}/restructures`, proposal);
  }

  /**
   * @param status APPROVED or REJECTED.
   * @returns Updated wrapper (case flips RESTRUCTURED on approval).
   */
  syncRestructure(restructureId: number, status: string): Observable<any> {
    return this.http.post(`/v2/collection-activities/restructures/${restructureId}/sync`, { status });
  }
}
