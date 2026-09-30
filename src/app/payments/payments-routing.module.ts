/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/** Custom Components */
import { RailsDashboardComponent } from './rails-dashboard/rails-dashboard.component';

/** Custom Resolvers */
import { PaymentRailsResolver, PaymentThroughputResolver } from './payments.resolver';

/** Custom Services */
import { Route } from '../core/route/route.service';

const routes: Routes = [
  Route.withShell([
    {
      path: '',
      pathMatch: 'full',
      component: RailsDashboardComponent,
      data: { title: 'Payment Rails', breadcrumb: 'Payment Rails', routeParamBreadcrumb: false },
      resolve: {
        rails: PaymentRailsResolver,
        throughput: PaymentThroughputResolver
      }
    }
  ])
];

/**
 * Payments routing module.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [PaymentRailsResolver, PaymentThroughputResolver]
})
export class PaymentsRoutingModule {}
