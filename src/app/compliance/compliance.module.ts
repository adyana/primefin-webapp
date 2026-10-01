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
import { ComplianceRoutingModule } from './compliance-routing.module';

/** Custom Components */
import { DenyListBoardComponent } from './deny-list-board/deny-list-board.component';

/**
 * Compliance module: deny-list board, import, hit audit, allow-list (slice #1).
 */
@NgModule({
  imports: [
    ComplianceRoutingModule,
    DenyListBoardComponent
  ],
  exports: [],
  declarations: [],
  providers: []
})
export class ComplianceModule {}
