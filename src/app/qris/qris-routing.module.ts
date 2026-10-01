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
import { QrisDashboardComponent } from './dashboard/dashboard.component';
import { QrisMerchantsComponent } from './merchants/merchants.component';
import { CreateMerchantComponent } from './create-merchant/create-merchant.component';
import { ViewMerchantComponent } from './view-merchant/view-merchant.component';
import { QrisMdrRulesComponent } from './mdr-rules/mdr-rules.component';

/** Custom Resolvers */
import { QrisMerchantResolver, QrisMerchantsResolver, QrisMdrRulesResolver } from './qris.resolver';

/** Custom Services */
import { Route } from '../core/route/route.service';

const routes: Routes = [
  Route.withShell([
    {
      path: 'dashboard',
      component: QrisDashboardComponent,
      data: { title: 'QRIS Dashboard', breadcrumb: 'Dashboard', routeParamBreadcrumb: false }
    },
    {
      path: '',
      pathMatch: 'full',
      component: QrisMerchantsComponent,
      data: { title: 'QRIS Merchants', breadcrumb: 'Merchants', routeParamBreadcrumb: false },
      resolve: {
        merchants: QrisMerchantsResolver
      }
    },
    {
      path: 'create',
      component: CreateMerchantComponent,
      data: { title: 'Create Merchant', breadcrumb: 'Create', routeParamBreadcrumb: false }
    },
    {
      path: 'mdr-rules',
      component: QrisMdrRulesComponent,
      data: { title: 'QRIS MDR Rules', breadcrumb: 'MDR Rules', routeParamBreadcrumb: false },
      resolve: {
        rules: QrisMdrRulesResolver
      }
    },
    {
      path: ':id',
      component: ViewMerchantComponent,
      data: { title: 'QRIS Merchant', breadcrumb: 'Merchant', routeParamBreadcrumb: false },
      resolve: {
        merchant: QrisMerchantResolver
      }
    }
  ])
];

/**
 * QRIS routing module.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    QrisMerchantsResolver,
    QrisMerchantResolver,
    QrisMdrRulesResolver
  ]
})
export class QrisRoutingModule {}
