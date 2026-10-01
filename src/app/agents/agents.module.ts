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
import { AgentsRoutingModule } from './agents-routing.module';

/** Custom Components */
import { AgentsDashboardComponent } from './dashboard/dashboard.component';
import { AgentsListComponent } from './agents-list/agents-list.component';
import { CreateAgentComponent } from './create-agent/create-agent.component';
import { ViewAgentComponent } from './view-agent/view-agent.component';

/**
 * Agents module: branchless agent registry + float lifecycle (AB).
 */
@NgModule({
  imports: [
    AgentsRoutingModule,
    AgentsDashboardComponent,
    AgentsListComponent,
    CreateAgentComponent,
    ViewAgentComponent
  ],
  exports: [],
  declarations: [],
  providers: []
})
export class AgentsModule {}
