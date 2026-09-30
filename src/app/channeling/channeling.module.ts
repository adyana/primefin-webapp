/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { NgModule } from '@angular/core';

/** Custom Modules */
import { ChannelingRoutingModule } from './channeling-routing.module';

/** Custom Components */
import { ChannelDashboardComponent } from './dashboard/dashboard.component';
import { ChannelPartnersComponent } from './partners/partners.component';
import { CreatePartnerComponent } from './create-partner/create-partner.component';
import { ViewPartnerComponent } from './view-partner/view-partner.component';
import { ChannelFilesComponent } from './files/files.component';

/**
 * Channeling module: partner registry + product/rate/cap/window config (P3).
 */
@NgModule({
  imports: [
    ChannelingRoutingModule,
    ChannelDashboardComponent,
    ChannelPartnersComponent,
    CreatePartnerComponent,
    ViewPartnerComponent,
    ChannelFilesComponent
  ],
  exports: [],
  declarations: [],
  providers: []
})
export class ChannelingModule {}
