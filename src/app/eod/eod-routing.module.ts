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
import { EodStatusComponent } from './status/status.component';

/** Custom Services */
import { Route } from '../core/route/route.service';

const routes: Routes = [
  Route.withShell([
    {
      path: '',
      component: EodStatusComponent,
      data: { title: 'EOD Cockpit', breadcrumb: 'Status', routeParamBreadcrumb: false }
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EodRoutingModule {}
