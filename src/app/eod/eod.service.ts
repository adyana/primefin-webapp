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
 * EOD cockpit service: end-of-day status pane (program EOD Phase A).
 */
@Injectable({ providedIn: 'root' })
export class EodService {
  private http = inject(HttpClient);

  /**
   * @returns Business dates, EOD job health, catch-up watermarks, module poller summaries.
   */
  getStatus(): Observable<any> {
    return this.http.get('/v2/eod-status');
  }

  /**
   * @param targetDate ISO target business date (optional; server wall clock when omitted).
   * @param maxDays Catch-up cap (optional; 31 when omitted).
   * @returns Dry-run plan: days that would close, no execution.
   */
  getRunPlan(targetDate?: string, maxDays?: number): Observable<any> {
    const params: Record<string, string> = {};
    if (targetDate) {
      params['targetDate'] = targetDate;
    }
    if (maxDays) {
      params['maxDays'] = String(maxDays);
    }
    return this.http.get('/v2/eod-run/plan', { params });
  }

  /**
   * @param run Run payload (targetDate, maxDays).
   * @returns Started run id plus the day list (no-op when dates current).
   */
  startRun(run: any): Observable<any> {
    return this.http.post('/v2/eod-run', run);
  }

  /**
   * @param runId Run id from startRun.
   * @returns Run snapshot with step progress.
   */
  getRun(runId: string): Observable<any> {
    return this.http.get(`/v2/eod-run/runs/${runId}`);
  }
}
