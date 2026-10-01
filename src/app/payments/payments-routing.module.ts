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
import { TreasuryComponent } from './treasury/treasury.component';
import { RailsDashboardComponent } from './rails-dashboard/rails-dashboard.component';
import { PaymentBreaksComponent } from './breaks/breaks.component';
import { PaymentFraudSlaComponent } from './fraud-sla/fraud-sla.component';
import { PaymentBatchesComponent } from './batches/batches.component';
import { ViewPaymentBatchComponent } from './view-batch/view-batch.component';
import { PaymentMatchingComponent } from './matching/matching.component';
import { PaymentMandatesComponent } from './mandates/mandates.component';
import { CreateMandateComponent } from './create-mandate/create-mandate.component';
import { PaymentCollectionsComponent } from './collections/collections.component';
import { CreateCollectionComponent } from './create-collection/create-collection.component';
import { PaymentSchedulesComponent } from './schedules/schedules.component';
import { CreateScheduleComponent } from './create-schedule/create-schedule.component';

/** Custom Resolvers */
import {
  PaymentRailsResolver,
  PaymentThroughputResolver,
  PaymentBreaksResolver,
  PaymentFraudSlaResolver,
  PaymentBatchesResolver,
  PaymentBatchResolver,
  PaymentMandatesResolver,
  PaymentCollectionsResolver,
  PaymentSchedulesResolver,
  PaymentMatchRulesResolver
} from './payments.resolver';

/** Custom Services */
import { Route } from '../core/route/route.service';

const routes: Routes = [
  Route.withShell([
    {
      path: '',
      pathMatch: 'full',
      component: RailsDashboardComponent,
      data: { title: 'Payments Dashboard', breadcrumb: 'Dashboard', routeParamBreadcrumb: false },
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
    },
    {
      path: 'mandates',
      component: PaymentMandatesComponent,
      data: { title: 'Payment Mandates', breadcrumb: 'Mandates', routeParamBreadcrumb: false },
      resolve: {
        mandates: PaymentMandatesResolver
      }
    },
    {
      path: 'mandates/create',
      component: CreateMandateComponent,
      data: { title: 'Create Mandate', breadcrumb: 'Create', routeParamBreadcrumb: false }
    },
    {
      path: 'collections',
      component: PaymentCollectionsComponent,
      data: { title: 'Payment Collections', breadcrumb: 'Collections', routeParamBreadcrumb: false },
      resolve: {
        collections: PaymentCollectionsResolver
      }
    },
    {
      path: 'collections/create',
      component: CreateCollectionComponent,
      data: { title: 'Create Collection', breadcrumb: 'Create', routeParamBreadcrumb: false }
    },
    {
      path: 'schedules',
      component: PaymentSchedulesComponent,
      data: { title: 'Payment Schedules', breadcrumb: 'Schedules', routeParamBreadcrumb: false },
      resolve: {
        schedules: PaymentSchedulesResolver
      }
    },
    {
      path: 'schedules/create',
      component: CreateScheduleComponent,
      data: { title: 'Create Schedule', breadcrumb: 'Create', routeParamBreadcrumb: false }
    },
    {
      path: 'treasury',
      component: TreasuryComponent,
      data: { title: 'Treasury Funding', breadcrumb: 'Treasury', routeParamBreadcrumb: false }
    },
    {
      path: 'matching',
      component: PaymentMatchingComponent,
      data: { title: 'Reconciliation Matching', breadcrumb: 'Matching', routeParamBreadcrumb: false },
      resolve: {
        rules: PaymentMatchRulesResolver
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
    PaymentBatchResolver,
    PaymentMandatesResolver,
    PaymentCollectionsResolver,
    PaymentSchedulesResolver,
    PaymentMatchRulesResolver
  ]
})
export class PaymentsRoutingModule {}
