/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0.
 */

/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Custom Components */
import { ComplaintQueuePageComponent } from './complaint-queue-page/complaint-queue-page.component';
import { ComplaintManagePageComponent } from './complaint-manage-page/complaint-manage-page.component';

/** Custom Resolvers */
import { ComplaintManagementResolver } from './complaint-management.resolver';

/** Complaint Management Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: '',
      component: ComplaintQueuePageComponent,
      data: { title: 'Complaint Queue', breadcrumb: 'Complaint Queue' },
      resolve: {
        complaints: ComplaintManagementResolver
      }
    },
    {
      path: ':id',
      component: ComplaintManagePageComponent,
      data: { title: 'Manage Complaint', breadcrumb: 'Manage Complaint' }
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [ComplaintManagementResolver],
  exports: [RouterModule]
})
export class ComplaintManagementRoutingModule {}
