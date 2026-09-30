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
import { RailsDashboardComponent } from './rails-dashboard/rails-dashboard.component';

/**
 * Payments module: ID payment rails dashboard (slice 1).
 */
@NgModule({
  imports: [PaymentsRoutingModule, RailsDashboardComponent],
  exports: [],
  declarations: [],
  providers: []
})
export class PaymentsModule {}
