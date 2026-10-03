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
import { PipelineBoardComponent } from './pipeline-board/pipeline-board.component';
import { ApprovalsBoardComponent } from './approvals-board/approvals-board.component';

/** Custom Resolvers */
import { ApplicationsResolver, ApprovalQueueResolver } from './onboarding.resolver';

/** Custom Services */
import { Route } from '../core/route/route.service';

const routes: Routes = [
  Route.withShell([
    {
      path: '',
      pathMatch: 'full',
      component: PipelineBoardComponent,
      data: { title: 'Pipeline', breadcrumb: 'Pipeline', routeParamBreadcrumb: false },
      resolve: {
        applications: ApplicationsResolver
      }
    },
    {
      path: 'approvals',
      component: ApprovalsBoardComponent,
      data: { title: 'Approvals', breadcrumb: 'Approvals', routeParamBreadcrumb: false },
      resolve: {
        queue: ApprovalQueueResolver
      }
    }
  ])
];

/**
 * Onboarding routing module.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    ApplicationsResolver,
    ApprovalQueueResolver
  ]
})
export class OnboardingRoutingModule {}
