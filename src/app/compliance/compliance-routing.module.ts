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

/** Custom Resolvers */
import { ComplianceListsResolver } from './compliance.resolver';

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
    }
  ])
];

/**
 * Compliance routing module.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [ComplianceListsResolver]
})
export class ComplianceRoutingModule {}
