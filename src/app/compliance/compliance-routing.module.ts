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
import { DenyListBoardComponent } from './deny-list-board/deny-list-board.component';
import { AmlRulesComponent } from './aml-rules/aml-rules.component';
import { AmlCasesComponent } from './aml-cases/aml-cases.component';
import { AmlReportsComponent } from './aml-reports/aml-reports.component';
import { SlikBoardComponent } from './slik-board/slik-board.component';
import { FilingsBoardComponent } from './filings-board/filings-board.component';

/** Custom Resolvers */
import {
  AmlCasesResolver,
  AmlReportsResolver,
  AmlRulesResolver,
  ComplianceListsResolver,
  FilingsResolver,
  SlikSnapshotsResolver
} from './compliance.resolver';

/** Custom Services */
import { Route } from '../core/route/route.service';

const routes: Routes = [
  Route.withShell([
    {
      path: '',
      pathMatch: 'full',
      component: DenyListBoardComponent,
      data: { title: 'Deny List', breadcrumb: 'Deny List', routeParamBreadcrumb: false },
      resolve: {
        lists: ComplianceListsResolver
      }
    },
    {
      path: 'aml-rules',
      component: AmlRulesComponent,
      data: { title: 'AML Rules', breadcrumb: 'AML Rules', routeParamBreadcrumb: false },
      resolve: {
        rules: AmlRulesResolver
      }
    },
    {
      path: 'cases',
      component: AmlCasesComponent,
      data: { title: 'AML Cases', breadcrumb: 'Cases', routeParamBreadcrumb: false },
      resolve: {
        cases: AmlCasesResolver
      }
    },
    {
      path: 'reports',
      component: AmlReportsComponent,
      data: { title: 'AML Reports', breadcrumb: 'Reports', routeParamBreadcrumb: false },
      resolve: {
        reports: AmlReportsResolver
      }
    },
    {
      path: 'slik',
      component: SlikBoardComponent,
      data: { title: 'SLIK Snapshots', breadcrumb: 'SLIK', routeParamBreadcrumb: false },
      resolve: {
        snapshots: SlikSnapshotsResolver
      }
    },
    {
      path: 'filings',
      component: FilingsBoardComponent,
      data: { title: 'Filing Log', breadcrumb: 'Filings', routeParamBreadcrumb: false },
      resolve: {
        filings: FilingsResolver
      }
    }
  ])
];

/**
 * Compliance routing module.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    ComplianceListsResolver,
    AmlRulesResolver,
    AmlCasesResolver,
    AmlReportsResolver,
    SlikSnapshotsResolver,
    FilingsResolver
  ]
})
export class ComplianceRoutingModule {}
