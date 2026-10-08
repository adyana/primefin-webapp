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
}
