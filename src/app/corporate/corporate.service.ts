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
 * Corporate registry service: corporate clients owning batches,
 * payroll runs and statements.
 */
@Injectable({ providedIn: 'root' })
export class CorporateService {
  private http = inject(HttpClient);

  /**
   * @param status Corporate status filter (optional; all when omitted).
   * @returns Corporates, newest first.
   */
  getCorporates(status?: string): Observable<any> {
    const params: Record<string, string> = {};
    if (status) {
      params['status'] = status;
    }
    return this.http.get('/v2/corporates', { params });
  }

  /**
   * @returns One corporate.
   */
  getCorporate(corporateId: number): Observable<any> {
    return this.http.get(`/v2/corporates/${corporateId}`);
  }

  /**
   * @param corporate Corporate payload (code, name, segment, prefundVaId).
   * @returns Created ACTIVE corporate.
   */
  createCorporate(corporate: any): Observable<any> {
    return this.http.post('/v2/corporates', corporate);
  }

  /**
   * @returns Corporate with updated name, segment or prefund VA.
   */
  updateCorporate(corporateId: number, corporate: any): Observable<any> {
    return this.http.post(`/v2/corporates/${corporateId}`, corporate);
  }

  /**
   * @returns Suspended corporate.
   */
  suspendCorporate(corporateId: number): Observable<any> {
    return this.http.post(`/v2/corporates/${corporateId}/suspend`, {});
  }

  /**
   * @returns Reactivated corporate.
   */
  reactivateCorporate(corporateId: number): Observable<any> {
    return this.http.post(`/v2/corporates/${corporateId}/reactivate`, {});
  }

  /**
   * @returns Closed corporate (terminal).
   */
  closeCorporate(corporateId: number): Observable<any> {
    return this.http.post(`/v2/corporates/${corporateId}/close`, {});
  }
}
