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
import { QrisRoutingModule } from './qris-routing.module';

/** Custom Components */
import { QrisDashboardComponent } from './dashboard/dashboard.component';
import { QrisMerchantsComponent } from './merchants/merchants.component';
import { CreateMerchantComponent } from './create-merchant/create-merchant.component';
import { ViewMerchantComponent } from './view-merchant/view-merchant.component';
import { QrisMdrRulesComponent } from './mdr-rules/mdr-rules.component';

/**
 * QRIS module: outlet registry, static codes, MDR-rated transactions (QR1).
 */
@NgModule({
  imports: [
    QrisRoutingModule,
    QrisDashboardComponent,
    QrisMerchantsComponent,
    CreateMerchantComponent,
    ViewMerchantComponent,
    QrisMdrRulesComponent
  ],
  exports: [],
  declarations: [],
  providers: []
})
export class QrisModule {}
