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
import { ChannelPartnersComponent } from './partners/partners.component';
import { CreatePartnerComponent } from './create-partner/create-partner.component';
import { ViewPartnerComponent } from './view-partner/view-partner.component';
import { ChannelFilesComponent } from './files/files.component';

/** Custom Resolvers */
import { ChannelPartnersResolver } from './channel-partners.resolver';
import { ChannelPartnerResolver } from './channel-partner.resolver';
import { ChannelFilesResolver } from './channel-files.resolver';

/** Custom Services */
import { Route } from '../core/route/route.service';

const routes: Routes = [
  Route.withShell([
    {
      path: '',
      pathMatch: 'full',
      component: ChannelPartnersComponent,
      data: { title: 'Channel Partners', breadcrumb: 'Channel Partners', routeParamBreadcrumb: false },
      resolve: {
        partners: ChannelPartnersResolver
      }
    },
    {
      path: 'create',
      component: CreatePartnerComponent,
      data: { title: 'Create Channel Partner', breadcrumb: 'Create', routeParamBreadcrumb: false }
    },
    {
      path: 'files',
      component: ChannelFilesComponent,
      data: { title: 'Channel Files', breadcrumb: 'Files', routeParamBreadcrumb: false },
      resolve: {
        files: ChannelFilesResolver
      }
    },
    {
      path: ':id',
      component: ViewPartnerComponent,
      data: { title: 'Channel Partner', breadcrumb: 'Partner', routeParamBreadcrumb: false },
      resolve: {
        partner: ChannelPartnerResolver
      }
    }
  ])
];

/**
 * Channeling routing module.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    ChannelPartnersResolver,
    ChannelPartnerResolver,
    ChannelFilesResolver
  ]
})
export class ChannelingRoutingModule {}
