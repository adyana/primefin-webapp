/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable, catchError, of } from 'rxjs';

/** Custom Services */
import { QrisService } from './qris.service';

/**
 * Merchants list data resolver (empty list when the backend is unreachable).
 */
@Injectable()
export class QrisMerchantsResolver {
  private qrisService = inject(QrisService);

  /**
   * Returns all onboarded merchants.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.qrisService.getMerchants().pipe(catchError(() => of([])));
  }
}

/**
 * Single merchant data resolver (undefined when the id is unknown).
 */
@Injectable()
export class QrisMerchantResolver {
  private qrisService = inject(QrisService);

  /**
   * Returns one merchant by route id.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.qrisService.getMerchant(route.params['id']).pipe(catchError(() => of(undefined)));
  }
}

/**
 * MDR rules data resolver (empty list when the backend is unreachable).
 */
@Injectable()
export class QrisMdrRulesResolver {
  private qrisService = inject(QrisService);

  /**
   * Returns all MDR bands.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.qrisService.getMdrRules().pipe(catchError(() => of([])));
  }
}
