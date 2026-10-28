/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

/** Custom Services */
import { GiroAccountsService } from './giro-accounts.service';

/** Custom Models */
import { GiroAccountDetail } from './giro-accounts.model';

/**
 * Giro Account resolver.
 */
@Injectable({
  providedIn: 'root'
})
export class GiroAccountResolver implements Resolve<GiroAccountDetail> {
  private giroAccountsService = inject(GiroAccountsService);

  /**
   * Resolve giro account detail
   * @param route Activated route snapshot
   * @returns Observable of giro account detail
   */
  resolve(route: ActivatedRouteSnapshot): Observable<GiroAccountDetail> {
    const id = Number(route.paramMap.get('id'));
    return this.giroAccountsService.getGiroAccount(id);
  }
}
