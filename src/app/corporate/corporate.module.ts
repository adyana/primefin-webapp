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
import { CorporateRoutingModule } from './corporate-routing.module';

/** Custom Components */
import { CorporateRegistryComponent } from './registry/registry.component';
import { CorporateBatchesComponent } from './batches/batches.component';
import { CorporateApprovalsComponent } from './approvals/approvals.component';
import { CorporatePayrollComponent } from './payroll/payroll.component';
import { CorporateStatementsComponent } from './statements/statements.component';

/**
 * Corporate module: client registry for cash management + payroll
 * (program #11 Phase A; batches, payroll, statements follow).
 */
@NgModule({
  imports: [
    CorporateRoutingModule,
    CorporateRegistryComponent,
    CorporateBatchesComponent,
    CorporateApprovalsComponent,
    CorporatePayrollComponent,
    CorporateStatementsComponent
  ],
  exports: [],
  declarations: [],
  providers: []
})
export class CorporateModule {}
