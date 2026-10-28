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
import { DepositoAccountsComponent } from './deposito-accounts.component';
import { DepositoAccountDetailComponent } from './deposito-account-detail/deposito-account-detail.component';

/** Custom Resolvers */
import { DepositoAccountsResolver } from './deposito-accounts.resolver';
import { DepositoAccountResolver } from './deposito-account.resolver';

/** Core */
import { Route } from 'app/core/route/route.service';

/** Deposito Accounts Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: '',
      data: { title: 'Deposito Accounts', breadcrumb: 'Deposito Accounts' },
      children: [
        {
          path: '',
          component: DepositoAccountsComponent,
          resolve: {
            depositoAccounts: DepositoAccountsResolver
          }
        },
        {
          path: ':id',
          component: DepositoAccountDetailComponent,
          resolve: {
            depositoAccount: DepositoAccountResolver
          },
          data: { title: 'Deposito Account', breadcrumb: 'id' }
        }
      ]
    }
  ])
];

/**
 * Deposito Accounts Routing Module
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    DepositoAccountsResolver,
    DepositoAccountResolver
  ]
})
export class DepositoAccountsRoutingModule {}
