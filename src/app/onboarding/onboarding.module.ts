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
import { OnboardingRoutingModule } from './onboarding-routing.module';

/** Custom Components */
import { PipelineBoardComponent } from './pipeline-board/pipeline-board.component';
import { ApprovalsBoardComponent } from './approvals-board/approvals-board.component';

/**
 * Onboarding module: credit-application pipeline board plus approval
 * queue with maker-not-equal-checker decisions (program #9).
 */
@NgModule({
  imports: [
    OnboardingRoutingModule,
    PipelineBoardComponent,
    ApprovalsBoardComponent
  ],
  exports: [],
  declarations: [],
  providers: []
})
export class OnboardingModule {}
