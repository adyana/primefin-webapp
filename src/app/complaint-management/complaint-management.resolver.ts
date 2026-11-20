/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

/** Custom Services */
import { ComplaintsService } from '../complaints/complaints.service';

/**
 * Complaint management (officer queue) data resolver.
 */
@Injectable()
export class ComplaintManagementResolver {
  private complaintsService = inject(ComplaintsService);

  /**
   * Returns the complaint management queue data (all complaints for officers).
   * Gracefully returns empty queue on failure so route navigation is not blocked.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    // Officer view: get all complaints (no status filter)
    return this.complaintsService.getComplaints().pipe(
      catchError(() => of({}))
    );
  }
}
