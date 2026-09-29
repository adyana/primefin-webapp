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
import { Observable, map } from 'rxjs';

/** Custom Services */
import { ChannelingService } from './channeling.service';

/**
 * Single channel partner data resolver (selects from the registry by id).
 */
@Injectable()
export class ChannelPartnerResolver {
  private channelingService = inject(ChannelingService);

  /**
   * Returns the partner matching the route id.
   * @param route Activated route snapshot.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const partnerId = Number(route.paramMap.get('id'));
    return this.channelingService
      .getPartners()
      .pipe(map((partners: any[]) => (partners || []).find((partner: any) => Number(partner.id) === partnerId)));
  }
}
