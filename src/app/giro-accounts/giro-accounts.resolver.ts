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
import { GiroAccountData } from './giro-accounts.model';

/**
 * Giro Accounts resolver.
 */
@Injectable({
  providedIn: 'root'
})
export class GiroAccountsResolver implements Resolve<GiroAccountData> {
  private giroAccountsService = inject(GiroAccountsService);

  /**
   * Resolve giro accounts data
   * @param route Activated route snapshot
   * @returns Observable of giro account data
   */
  resolve(route: ActivatedRouteSnapshot): Observable<GiroAccountData> {
    return this.giroAccountsService.getAllGiroAccounts();
  }
}
