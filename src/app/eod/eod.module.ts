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
import { EodRoutingModule } from './eod-routing.module';

/** Custom Components */
import { EodStatusComponent } from './status/status.component';

/**
 * EOD cockpit module: end-of-day status pane (program EOD Phase A).
 */
@NgModule({
  imports: [
    EodRoutingModule,
    EodStatusComponent
  ],
  exports: [],
  declarations: [],
  providers: []
})
export class EodModule {}
