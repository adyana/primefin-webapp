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
 * Treasury ratios service: prudential capital, limits, CAR/exposure
 * computation and KPMM/BMPK filing (program #13 Phase D).
 */
@Injectable({ providedIn: 'root' })
export class TreasuryRatiosService {
  private http = inject(HttpClient);

  /**
   * @returns Capital snapshots, newest period first.
   */
  getCapital(): Observable<any> {
    return this.http.get('/v2/treasury-ratios/capital');
  }

  /**
   * @param capital Capital payload (period YYYYMM, modalInti).
   * @returns Recorded capital snapshot.
   */
  recordCapital(capital: any): Observable<any> {
    return this.http.post('/v2/treasury-ratios/capital', capital);
  }

  /**
   * @returns Prudential thresholds by code.
   */
  getLimits(): Observable<any> {
    return this.http.get('/v2/treasury-ratios/limits');
  }

  /**
   * @param limit Threshold payload (code, thresholdPct, severity).
   * @returns Created or retuned threshold.
   */
  upsertLimit(limit: any): Observable<any> {
    return this.http.post('/v2/treasury-ratios/limits', limit);
  }

  /**
   * @param period SLIK month-end period (YYYYMM).
   * @returns CAR, exposures and limit evaluation (alerts on breach).
   */
  getRatios(period: string): Observable<any> {
    return this.http.get(`/v2/treasury-ratios/${period}`);
  }

  /**
   * @returns One-pane treasury overview (placements, nostro, headroom, matcher).
   */
  getDashboard(): Observable<any> {
    return this.http.get('/v2/treasury-dashboard');
  }

  /**
   * @param period SLIK month-end period (YYYYMM).
   * @returns Filed KPMM submission.
   */
  fileKpmm(period: string): Observable<any> {
    return this.http.post(`/v2/prudential/${period}/kpmm/file`, {});
  }

  /**
   * @param period SLIK month-end period (YYYYMM).
   * @returns Filed BMPK submission.
   */
  fileBmpk(period: string): Observable<any> {
    return this.http.post(`/v2/prudential/${period}/bmpk/file`, {});
  }

  /**
   * Downloads a filing's rendered extract through the authenticated client.
   * @param id Filing id.
   */
  downloadFiling(id: number): void {
    this.http.get(`/v2/prudential/download/${id}`, { responseType: 'blob' }).subscribe((blob: Blob) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `prudential-filing-${id}.txt`;
      anchor.click();
      URL.revokeObjectURL(url);
    });
  }
}
