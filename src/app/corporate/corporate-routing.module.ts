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
import { CorporateRegistryComponent } from './registry/registry.component';
import { CorporateBatchesComponent } from './batches/batches.component';
import { CorporateApprovalsComponent } from './approvals/approvals.component';
import { CorporatePayrollComponent } from './payroll/payroll.component';
import { CorporateStatementsComponent } from './statements/statements.component';

/** Custom Services */
import { Route } from '../core/route/route.service';

const routes: Routes = [
  Route.withShell([
    {
      path: '',
      component: CorporateRegistryComponent,
      data: { title: 'Corporate Registry', breadcrumb: 'Registry', routeParamBreadcrumb: false }
    },
    {
      path: 'batches',
      component: CorporateBatchesComponent,
      data: { title: 'Corporate Batches', breadcrumb: 'Batches', routeParamBreadcrumb: false }
    },
    {
      path: 'approvals',
      component: CorporateApprovalsComponent,
      data: { title: 'Corporate Approvals', breadcrumb: 'Approvals', routeParamBreadcrumb: false }
    },
    {
      path: 'payroll',
      component: CorporatePayrollComponent,
      data: { title: 'Corporate Payroll', breadcrumb: 'Payroll', routeParamBreadcrumb: false }
    },
    {
      path: 'statements',
      component: CorporateStatementsComponent,
      data: { title: 'Corporate Statements', breadcrumb: 'Statements', routeParamBreadcrumb: false }
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CorporateRoutingModule {}
