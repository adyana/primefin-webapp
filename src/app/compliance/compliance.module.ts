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
import { AmlRulesComponent } from './aml-rules/aml-rules.component';
import { AmlCasesComponent } from './aml-cases/aml-cases.component';
import { AmlReportsComponent } from './aml-reports/aml-reports.component';

/**
 * Compliance module: deny-list board, import, hit audit, allow-list
 * (slice #1) plus AML monitoring rules, cases and reports (program #5).
 */
@NgModule({
  imports: [
    ComplianceRoutingModule,
    DenyListBoardComponent,
    AmlRulesComponent,
    AmlCasesComponent,
    AmlReportsComponent
  ],
  exports: [],
  declarations: [],
  providers: []
})
export class ComplianceModule {}
