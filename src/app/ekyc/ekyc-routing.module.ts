/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0.
 */
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
import { EkycPageComponent } from './ekyc-page/ekyc-page.component';

/** Custom Resolvers */
import { EkycResolver } from './ekyc.resolver';

/** e-KYC Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: '',
      component: EkycPageComponent,
      data: { title: 'e-KYC Onboarding', breadcrumb: 'e-KYC' },
      resolve: {
        ekyc: EkycResolver
      }
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [EkycResolver],
  exports: [RouterModule]
})
export class EkycRoutingModule {}
