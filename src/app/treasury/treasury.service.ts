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
 * Treasury service: money-market placements (Phase A).
 */
@Injectable({ providedIn: 'root' })
export class TreasuryService {
  private http = inject(HttpClient);

  /**
   * @param status Placement status filter (optional; all when omitted).
   * @returns Placements, newest first.
   */
  getPlacements(status?: string): Observable<any> {
    const params: Record<string, string> = {};
    if (status) {
      params['status'] = status;
    }
    return this.http.get('/v2/treasury-placements', { params });
  }

  /**
   * @param placement Placement payload (counterpartyBank, currency, amount, rateBps, valueDate, maturityDate).
   * @returns Created PLACED placement.
   */
  placePlacement(placement: any): Observable<any> {
    return this.http.post('/v2/treasury-placements', placement);
  }

  /**
   * @returns Placement with interest accrued through the business date.
   */
  accruePlacement(placementId: number): Observable<any> {
    return this.http.post(`/v2/treasury-placements/${placementId}/accrue`, {});
  }

  /**
   * @returns MATURED placement with finalized interest.
   */
  maturePlacement(placementId: number): Observable<any> {
    return this.http.post(`/v2/treasury-placements/${placementId}/mature`, {});
  }
}
