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

const routes: Routes = [
  {
    path: '',
    component: CorporateRegistryComponent,
    data: { title: 'Corporate Registry', breadcrumb: 'Registry', routeParamBreadcrumb: false }
  },
  {
    path: 'batches',
    component: CorporateBatchesComponent,
    data: { title: 'Corporate Batches', breadcrumb: 'Batches', routeParamBreadcrumb: false }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CorporateRoutingModule {}
