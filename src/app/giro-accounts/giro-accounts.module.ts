/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { NgModule } from '@angular/core';

/** Custom Routing */
import { GiroAccountsRoutingModule } from './giro-accounts-routing.module';

/**
 * Giro Accounts Module
 */
@NgModule({
  imports: [
    GiroAccountsRoutingModule
  ],
  providers: []
})
export class GiroAccountsModule {}
