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
import { EkycReviewService } from './ekyc-review.service';

/**
 * e-KYC Review data resolver.
 */
@Injectable()
export class EkycReviewResolver {
  private ekycReviewService = inject(EkycReviewService);

  /**
   * Returns the e-KYC review queue data.
   * Gracefully returns empty queue on failure so route navigation is not blocked.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.ekycReviewService.getReviewQueue().pipe(
      catchError(() => of({}))
    );
  }
}
