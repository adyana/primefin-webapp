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
import { RemedialRoutingModule } from './remedial-routing.module';

/** Custom Components */
import { CollectionsWorkbenchComponent } from './workbench/workbench.component';
import { CollectionCaseDetailComponent } from './case-detail/case-detail.component';

/**
 * Remedial module: collections workbench queue plus case detail with
 * visits, promises, restructurings and write-off (program #10).
 * Named apart from upstream `collections` (collection sheets).
 */
@NgModule({
  imports: [
    RemedialRoutingModule,
    CollectionsWorkbenchComponent,
    CollectionCaseDetailComponent
  ],
  exports: [],
  declarations: [],
  providers: []
})
export class RemedialModule {}
