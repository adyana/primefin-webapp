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
import { DepositoAccountsService } from './deposito-accounts.service';

/** Custom Models */
import { DepositoAccountData } from './deposito-accounts.model';

/**
 * Deposito Accounts resolver.
 */
@Injectable({
  providedIn: 'root'
})
export class DepositoAccountsResolver implements Resolve<DepositoAccountData> {
  private depositoAccountsService = inject(DepositoAccountsService);

  /**
   * Resolve deposito accounts data
   * @param route Activated route snapshot
   * @returns Observable of deposito account data
   */
  resolve(route: ActivatedRouteSnapshot): Observable<DepositoAccountData> {
    return this.depositoAccountsService.getAllDepositoAccounts();
  }
}
