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
import { TreasuryPlacementsComponent } from './placements/placements.component';
import { TreasuryFxComponent } from './fx/fx.component';

const routes: Routes = [
  {
    path: '',
    component: TreasuryPlacementsComponent,
    data: { title: 'Treasury Placements', breadcrumb: 'Placements', routeParamBreadcrumb: false }
  },
  {
    path: 'fx',
    component: TreasuryFxComponent,
    data: { title: 'Treasury FX', breadcrumb: 'FX', routeParamBreadcrumb: false }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TreasuryRoutingModule {}
