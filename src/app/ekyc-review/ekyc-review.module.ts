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
import { NgModule } from '@angular/core';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { PipesModule } from '../pipes/pipes.module';
import { EkycReviewRoutingModule } from './ekyc-review-routing.module';

/** Custom Components */
import { EkycReviewQueuePageComponent } from './queue-page/queue-page.component';
import { EkycReviewDetailPageComponent } from './review-page/review-page.component';

/**
 * e-KYC Review Queue Module.
 * Officer-facing review queue: view pending e-KYC sessions,
 * approve, reject, or request re-attempt with reason.
 */
@NgModule({
  imports: [
    SharedModule,
    PipesModule,
    EkycReviewRoutingModule,
    EkycReviewQueuePageComponent,
    EkycReviewDetailPageComponent
  ]
})
export class EkycReviewModule {}
