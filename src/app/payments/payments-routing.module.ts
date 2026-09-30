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
import { PaymentBreaksComponent } from './breaks/breaks.component';
import { PaymentFraudSlaComponent } from './fraud-sla/fraud-sla.component';
import { PaymentBatchesComponent } from './batches/batches.component';
import { ViewPaymentBatchComponent } from './view-batch/view-batch.component';

/** Custom Resolvers */
import {
  PaymentRailsResolver,
  PaymentThroughputResolver,
  PaymentBreaksResolver,
  PaymentFraudSlaResolver,
  PaymentBatchesResolver,
  PaymentBatchResolver
} from './payments.resolver';

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
    },
    {
      path: 'breaks',
      component: PaymentBreaksComponent,
      data: { title: 'Payment Breaks', breadcrumb: 'Breaks', routeParamBreadcrumb: false },
      resolve: {
        breaks: PaymentBreaksResolver
      }
    },
    {
      path: 'fraud-sla',
      component: PaymentFraudSlaComponent,
      data: { title: 'Payment Fraud SLA', breadcrumb: 'Fraud SLA', routeParamBreadcrumb: false },
      resolve: {
        breaches: PaymentFraudSlaResolver
      }
    },
    {
      path: 'batches',
      component: PaymentBatchesComponent,
      data: { title: 'Payment Batches', breadcrumb: 'Batches', routeParamBreadcrumb: false },
      resolve: {
        batches: PaymentBatchesResolver
      }
    },
    {
      path: 'batches/:id',
      component: ViewPaymentBatchComponent,
      data: { title: 'Payment Batch', breadcrumb: 'Batch', routeParamBreadcrumb: false },
      resolve: {
        batch: PaymentBatchResolver
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
  providers: [
    PaymentRailsResolver,
    PaymentThroughputResolver,
    PaymentBreaksResolver,
    PaymentFraudSlaResolver,
    PaymentBatchesResolver,
    PaymentBatchResolver
  ]
})
export class PaymentsRoutingModule {}
