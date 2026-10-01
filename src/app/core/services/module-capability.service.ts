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
import { Observable, catchError, map, of } from 'rxjs';

/**
 * Module capability probes for menu gating (modular architecture Phase A).
 * Each vertical module exposes `/v2/<module>-health`; a failed probe hides
 * that module's menu subtree. Permission gating remains the second layer.
 * Core talks raw HTTP here so it never imports module services.
 */
@Injectable({
  providedIn: 'root'
})
export class ModuleCapabilityService {
  private http = inject(HttpClient);

  private probe(url: string): Observable<boolean> {
    return this.http.get(url).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  /** @returns True when the channeling module answers. */
  channelingAvailable(): Observable<boolean> {
    return this.probe('/v2/channel-health');
  }

  /** @returns True when the payments module answers. */
  paymentsAvailable(): Observable<boolean> {
    return this.probe('/v2/payment-health');
  }

  /** @returns True when the agent-banking module answers. */
  agentsAvailable(): Observable<boolean> {
    return this.probe('/v2/agent-health');
  }
}
