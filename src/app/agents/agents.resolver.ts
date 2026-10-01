/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable, catchError, of } from 'rxjs';

/** Custom Services */
import { AgentsService } from './agents.service';

/**
 * Agents list data resolver. A failed fetch resolves to an empty list so the
 * page renders an honest empty state instead of a route error.
 */
@Injectable()
export class AgentsResolver {
  private agentsService = inject(AgentsService);

  /**
   * Returns all registered agents.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.agentsService.getAgents().pipe(catchError(() => of([])));
  }
}

/**
 * Single agent data resolver (undefined when the id is unknown).
 */
@Injectable()
export class AgentResolver {
  private agentsService = inject(AgentsService);

  /**
   * Returns one agent by route id.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.agentsService.getAgent(route.params['id']).pipe(catchError(() => of(undefined)));
  }
}
