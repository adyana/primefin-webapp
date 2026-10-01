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
import { Observable, catchError, of } from 'rxjs';

/** Custom Services */
import { ComplianceService } from './compliance.service';

/**
 * Deny lists data resolver (empty list when the backend is unreachable).
 */
@Injectable()
export class ComplianceListsResolver {
  private complianceService = inject(ComplianceService);

  /**
   * Returns all deny lists.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.complianceService.getLists().pipe(catchError(() => of([])));
  }
}
