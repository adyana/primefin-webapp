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
import { CollectionsWorkbenchComponent } from './workbench/workbench.component';
import { CollectionCaseDetailComponent } from './case-detail/case-detail.component';

/** Custom Services */
import { Route } from '../core/route/route.service';

const routes: Routes = [
  Route.withShell([
    {
      path: '',
      component: CollectionsWorkbenchComponent,
      data: { title: 'Collections Workbench', breadcrumb: 'Workbench', routeParamBreadcrumb: false }
    },
    {
      path: 'cases/:id',
      component: CollectionCaseDetailComponent,
      data: { title: 'Collection Case', breadcrumb: 'Case', routeParamBreadcrumb: false }
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RemedialRoutingModule {}
