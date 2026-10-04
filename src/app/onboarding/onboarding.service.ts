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
 * Onboarding service: credit-application pipeline (list, board, advance,
 * score, approve, reject, disburse, book) plus verification pulls.
 */
@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  private http = inject(HttpClient);

  /**
   * @param stage Optional stage filter, e.g. APPROVAL.
   * @returns Paged applications with stage, status, score.
   */
  listApplications(stage?: string): Observable<any> {
    const params = stage ? `?stage=${stage}` : '';
    return this.http.get(`/v2/credit-applications${params}`);
  }

  /**
   * @param data Application fields.
   * @returns Create result with resourceId.
   */
  createApplication(data: any): Observable<any> {
    return this.http.post('/v2/credit-applications', data);
  }

  /**
   * @param id Application id.
   * @returns Board with current stage and stage history.
   */
  getBoard(id: number): Observable<any> {
    return this.http.get(`/v2/credit-applications/${id}/origination-board`);
  }

  /**
   * @param id Application id.
   * @param reason Advance reason.
   */
  advance(id: number, reason: string): Observable<any> {
    return this.http.post(`/v2/credit-applications/${id}/advance`, { reason });
  }

  /**
   * @param id Application id.
   */
  score(id: number): Observable<any> {
    return this.http.post(`/v2/credit-applications/${id}/score`, {});
  }

  /**
   * @param id Application id.
   * @param reason Approval reason.
   */
  approve(id: number, reason: string): Observable<any> {
    return this.http.post(`/v2/credit-applications/${id}/approve`, { reason });
  }

  /**
   * @param id Application id.
   * @param reason Rejection reason.
   */
  reject(id: number, reason: string): Observable<any> {
    return this.http.post(`/v2/credit-applications/${id}/reject`, { reason });
  }

  /**
   * @param id Application id.
   * @param reason Disbursal reason.
   */
  disburse(id: number, reason: string): Observable<any> {
    return this.http.post(`/v2/credit-applications/${id}/disburse`, { reason });
  }

  /**
   * @param id Application id.
   * @returns Booking result (loan linked).
   */
  book(id: number): Observable<any> {
    return this.http.post(`/v2/credit-applications/${id}/book`, {});
  }

  /**
   * @param clientId Client id.
   * @returns Verification envelopes, newest first.
   */
  getVerifications(clientId: number): Observable<any> {
    return this.http.get(`/v2/verifications/client/${clientId}`);
  }

  /**
   * @returns Channel partners for attribution pickers.
   */
  getChannelPartners(): Observable<any> {
    return this.http.get('/v2/channel-partners');
  }

  /**
   * @param entityType LOAN or PAYMENT.
   * @param entityId Entity id.
   * @param partnerCode Partner code.
   * @returns Attribution result with resourceId.
   */
  attributeMoney(entityType: string, entityId: number, partnerCode: string): Observable<any> {
    return this.http.post('/v2/channel-attribution', { entityType, entityId, partnerCode });
  }
}
