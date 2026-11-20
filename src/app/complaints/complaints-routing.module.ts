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
import { ComplaintListPageComponent } from './complaint-list-page/complaint-list-page.component';
import { FileComplaintPageComponent } from './file-complaint-page/file-complaint-page.component';
import { ComplaintDetailPageComponent } from './complaint-detail-page/complaint-detail-page.component';

/** Custom Resolvers */
import { ComplaintsResolver } from './complaints.resolver';

/** Complaints Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: '',
      component: ComplaintListPageComponent,
      data: { title: 'Complaints', breadcrumb: 'Complaints' },
      resolve: {
        complaints: ComplaintsResolver
      }
    },
    {
      path: 'file',
      component: FileComplaintPageComponent,
      data: { title: 'File Complaint', breadcrumb: 'File Complaint' }
    },
    {
      path: ':id',
      component: ComplaintDetailPageComponent,
      data: { title: 'Complaint Detail', breadcrumb: 'Complaint' }
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [ComplaintsResolver],
  exports: [RouterModule]
})
export class ComplaintsRoutingModule {}
