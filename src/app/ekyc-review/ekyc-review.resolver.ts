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
import { Observable } from 'rxjs';

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
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.ekycReviewService.getReviewQueue();
  }
}
