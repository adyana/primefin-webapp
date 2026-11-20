/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0.
 */

/** Angular Imports */
import { NgModule } from '@angular/core';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { PipesModule } from '../pipes/pipes.module';
import { ComplaintsRoutingModule } from './complaints-routing.module';

/** Custom Components */
import { ComplaintListPageComponent } from './complaint-list-page/complaint-list-page.component';
import { FileComplaintPageComponent } from './file-complaint-page/file-complaint-page.component';
import { ComplaintDetailPageComponent } from './complaint-detail-page/complaint-detail-page.component';

/**
 * Complaints Module.
 * Customer-facing complaint module: list, file, and view complaints.
 * Capability-gated on `complaint` flag; `GET /v2/complaint-health`
 * must 200 before the menu renders.
 */
@NgModule({
  imports: [
    SharedModule,
    PipesModule,
    ComplaintsRoutingModule,
    ComplaintListPageComponent,
    FileComplaintPageComponent,
    ComplaintDetailPageComponent
  ]
})
export class ComplaintsModule {}
