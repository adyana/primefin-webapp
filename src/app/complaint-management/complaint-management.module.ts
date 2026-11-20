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
import { ComplaintManagementRoutingModule } from './complaint-management-routing.module';

/** Custom Components */
import { ComplaintQueuePageComponent } from './complaint-queue-page/complaint-queue-page.component';
import { ComplaintManagePageComponent } from './complaint-manage-page/complaint-manage-page.component';

/**
 * Complaint Management Module.
 * Officer-facing complaint management: queue, assign, resolve, escalate.
 * Capability-gated on `complaint` flag; `UPDATE_COMPLAINT` permission required.
 */
@NgModule({
  imports: [
    SharedModule,
    PipesModule,
    ComplaintManagementRoutingModule,
    ComplaintQueuePageComponent,
    ComplaintManagePageComponent
  ]
})
export class ComplaintManagementModule {}
