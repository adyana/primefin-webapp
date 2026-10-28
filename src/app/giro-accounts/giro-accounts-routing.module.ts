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
import { GiroAccountsComponent } from './giro-accounts.component';
import { GiroAccountDetailComponent } from './giro-account-detail/giro-account-detail.component';

/** Custom Resolvers */
import { GiroAccountsResolver } from './giro-accounts.resolver';
import { GiroAccountResolver } from './giro-account.resolver';

/** Core */
import { Route } from 'app/core/route/route.service';

/** Giro Accounts Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: '',
      data: { title: 'Giro Accounts', breadcrumb: 'Giro Accounts' },
      children: [
        {
          path: '',
          component: GiroAccountsComponent,
          resolve: {
            giroAccounts: GiroAccountsResolver
          }
        },
        {
          path: ':id',
          component: GiroAccountDetailComponent,
          resolve: {
            giroAccount: GiroAccountResolver
          },
          data: { title: 'Giro Account', breadcrumb: 'id' }
        }
      ]
    }
  ])
];

/**
 * Giro Accounts Routing Module
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    GiroAccountsResolver,
    GiroAccountResolver
  ]
})
export class GiroAccountsRoutingModule {}
