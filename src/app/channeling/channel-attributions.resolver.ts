/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable, catchError, forkJoin, of } from 'rxjs';

/** Custom Services */
import { ChannelingService } from './channeling.service';

/**
 * Attribution board data resolver (empty lists when unreachable).
 */
@Injectable()
export class ChannelAttributionsResolver {
  private channelingService = inject(ChannelingService);

  /**
   * Returns attributions plus partners for the board form.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return forkJoin({
      attributions: this.channelingService.getAttributions().pipe(catchError(() => of([]))),
      partners: this.channelingService.getPartners().pipe(catchError(() => of([])))
    });
  }
}
