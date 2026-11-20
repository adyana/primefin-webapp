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
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Custom Components */
import { EkycReviewQueuePageComponent } from './queue-page/queue-page.component';
import { EkycReviewDetailPageComponent } from './review-page/review-page.component';

/** Custom Resolvers */
import { EkycReviewResolver } from './ekyc-review.resolver';

/** e-KYC Review Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: '',
      component: EkycReviewQueuePageComponent,
      data: { title: 'e-KYC Review Queue', breadcrumb: 'e-KYC Review' },
      resolve: {
        reviewQueue: EkycReviewResolver
      }
    },
    {
      path: 'review/:id',
      component: EkycReviewDetailPageComponent,
      data: { title: 'e-KYC Review Detail', breadcrumb: 'Review' }
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [EkycReviewResolver],
  exports: [RouterModule]
})
export class EkycReviewRoutingModule {}
