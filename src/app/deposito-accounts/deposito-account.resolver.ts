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
import { DepositoAccountDetail } from './deposito-accounts.model';

/**
 * Deposito Account resolver.
 */
@Injectable({
  providedIn: 'root'
})
export class DepositoAccountResolver implements Resolve<DepositoAccountDetail> {
  private depositoAccountsService = inject(DepositoAccountsService);

  /**
   * Resolve deposito account detail
   * @param route Activated route snapshot
   * @returns Observable of deposito account detail
   */
  resolve(route: ActivatedRouteSnapshot): Observable<DepositoAccountDetail> {
    const id = Number(route.paramMap.get('id'));
    return this.depositoAccountsService.getDepositoAccount(id);
  }
}
