/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0.
 */
/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Models */
import { EkycReviewItem } from './models/ekyc-review-item.model';

/**
 * e-KYC Review service.
 * Calls the backend /api/v2/ekyc/review-queue endpoints.
 */
@Injectable({
  providedIn: 'root'
})
export class EkycReviewService {
  private http = inject(HttpClient);

  /**
   * Get the e-KYC review queue (pending sessions for officer review).
   * @param status Optional status filter
   */
  getReviewQueue(status?: string): Observable<EkycReviewItem[]> {
    const params = status ? new HttpParams().set('status', status) : undefined;
    return this.http.get<EkycReviewItem[]>('/ekyc/review-queue', { params });
  }

  /**
   * Approve an e-KYC session.
   * @param id Session/review item ID
   * @param notes Optional approver notes
   */
  approve(id: string, notes?: string): Observable<EkycReviewItem> {
    return this.http.post<EkycReviewItem>(`/ekyc/review-queue/${id}/approve`, null, {
      params: notes ? new HttpParams().set('notes', notes) : undefined
    });
  }

  /**
   * Reject an e-KYC session.
   * @param id Session/review item ID
   * @param reason Rejection reason (required)
   */
  reject(id: string, reason: string): Observable<EkycReviewItem> {
    return this.http.post<EkycReviewItem>(`/ekyc/review-queue/${id}/reject`, null, {
      params: new HttpParams().set('reason', reason)
    });
  }

  /**
   * Request a re-attempt for an e-KYC session.
   * @param id Session/review item ID
   * @param reason Reason for re-attempt (required)
   */
  requestReattempt(id: string, reason: string): Observable<EkycReviewItem> {
    return this.http.post<EkycReviewItem>(`/ekyc/review-queue/${id}/request-reattempt`, null, {
      params: new HttpParams().set('reason', reason)
    });
  }
}
