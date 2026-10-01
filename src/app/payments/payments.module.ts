/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { NgModule } from '@angular/core';

/** Custom Modules */
import { PaymentsRoutingModule } from './payments-routing.module';

/** Custom Components */
import { TreasuryComponent } from './treasury/treasury.component';
import { RailsDashboardComponent } from './rails-dashboard/rails-dashboard.component';
import { PaymentBreaksComponent } from './breaks/breaks.component';
import { PaymentFraudSlaComponent } from './fraud-sla/fraud-sla.component';
import { PaymentBatchesComponent } from './batches/batches.component';
import { ViewPaymentBatchComponent } from './view-batch/view-batch.component';
import { PaymentMandatesComponent } from './mandates/mandates.component';
import { CreateMandateComponent } from './create-mandate/create-mandate.component';
import { PaymentCollectionsComponent } from './collections/collections.component';
import { CreateCollectionComponent } from './create-collection/create-collection.component';
import { PaymentSchedulesComponent } from './schedules/schedules.component';
import { CreateScheduleComponent } from './create-schedule/create-schedule.component';

/**
 * Payments module: ID payment rails dashboard (slice 1), breaks board and
 * fraud-SLA view (slice 2), batch monitor (slice 3), mandates + collections
 * boards and automation schedules (roadmap #2).
 */
@NgModule({
  imports: [
    PaymentsRoutingModule,
    TreasuryComponent,
    RailsDashboardComponent,
    PaymentBreaksComponent,
    PaymentFraudSlaComponent,
    PaymentBatchesComponent,
    ViewPaymentBatchComponent,
    PaymentMandatesComponent,
    CreateMandateComponent,
    PaymentCollectionsComponent,
    CreateCollectionComponent,
    PaymentSchedulesComponent,
    CreateScheduleComponent
  ],
  exports: [],
  declarations: [],
  providers: []
})
export class PaymentsModule {}
