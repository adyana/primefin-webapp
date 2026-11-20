/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Models */
import {
  Complaint,
  AssignComplaintRequest,
  ResolveComplaintRequest,
  EscalateComplaintRequest
} from '../complaints/models/complaint.model';

/**
 * Complaint management service.
 * Officer-facing actions: assign, resolve, escalate.
 * Capability-gated on `complaint` flag; `UPDATE_COMPLAINT` permission required.
 */
@Injectable({
  providedIn: 'root'
})
export class ComplaintManagementService {
  private http = inject(HttpClient);

  /**
   * Assign a complaint to an officer.
   * @param id Complaint ID
   * @param request Assign request with assigneeId
   */
  assignComplaint(
    id: number,
    request: AssignComplaintRequest
  ): Observable<{ resourceId: number; rollbackTransaction: boolean }> {
    return this.http.post<{ resourceId: number; rollbackTransaction: boolean }>(`/v2/complaints/${id}/assign`, request);
  }

  /**
   * Resolve a complaint with notes.
   * @param id Complaint ID
   * @param request Resolve request with notes
   */
  resolveComplaint(
    id: number,
    request: ResolveComplaintRequest
  ): Observable<{ resourceId: number; rollbackTransaction: boolean }> {
    return this.http.post<{ resourceId: number; rollbackTransaction: boolean }>(
      `/v2/complaints/${id}/resolve`,
      request
    );
  }

  /**
   * Escalate a complaint with notes.
   * @param id Complaint ID
   * @param request Escalate request with notes
   */
  escalateComplaint(
    id: number,
    request: EscalateComplaintRequest
  ): Observable<{ resourceId: number; rollbackTransaction: boolean }> {
    return this.http.post<{ resourceId: number; rollbackTransaction: boolean }>(
      `/v2/complaints/${id}/escalate`,
      request
    );
  }
}
