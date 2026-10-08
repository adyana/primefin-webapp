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
import { TreasuryRoutingModule } from './treasury-routing.module';

/** Custom Components */
import { TreasuryPlacementsComponent } from './placements/placements.component';
import { TreasuryFxComponent } from './fx/fx.component';

/**
 * Treasury module: money-market placements (program #13 Phase A;
 * FX, nostro, ratios follow).
 */
@NgModule({
  imports: [
    TreasuryRoutingModule,
    TreasuryPlacementsComponent,
    TreasuryFxComponent
  ],
  exports: [],
  declarations: [],
  providers: []
})
export class TreasuryModule {}
