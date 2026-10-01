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
import { AgentsDashboardComponent } from './dashboard/dashboard.component';
import { AgentsListComponent } from './agents-list/agents-list.component';
import { CreateAgentComponent } from './create-agent/create-agent.component';
import { ViewAgentComponent } from './view-agent/view-agent.component';

/** Custom Resolvers */
import { AgentResolver, AgentsResolver } from './agents.resolver';

/** Custom Services */
import { Route } from '../core/route/route.service';

const routes: Routes = [
  Route.withShell([
    {
      path: 'dashboard',
      component: AgentsDashboardComponent,
      data: { title: 'Agent Dashboard', breadcrumb: 'Dashboard', routeParamBreadcrumb: false }
    },
    {
      path: '',
      pathMatch: 'full',
      component: AgentsListComponent,
      data: { title: 'Agents', breadcrumb: 'Agents', routeParamBreadcrumb: false },
      resolve: {
        agents: AgentsResolver
      }
    },
    {
      path: 'create',
      component: CreateAgentComponent,
      data: { title: 'Create Agent', breadcrumb: 'Create', routeParamBreadcrumb: false }
    },
    {
      path: ':id',
      component: ViewAgentComponent,
      data: { title: 'Agent', breadcrumb: 'Agent', routeParamBreadcrumb: false },
      resolve: {
        agent: AgentResolver
      }
    }
  ])
];

/**
 * Agents routing module.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    AgentsResolver,
    AgentResolver
  ]
})
export class AgentsRoutingModule {}
