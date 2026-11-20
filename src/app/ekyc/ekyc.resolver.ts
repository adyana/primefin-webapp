/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0.
 */
/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

/** Custom Services */
import { EkycService } from './ekyc.service';

/**
 * e-KYC data resolver.
 */
@Injectable()
export class EkycResolver {
  private ekycService = inject(EkycService);

  /**
   * Returns the e-KYC configuration data.
   * Gracefully returns empty config on failure so route navigation is not blocked.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.ekycService.getConfig().pipe(
      catchError(() => of({}))
    );
  }
}
