/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Models */
import { Complaint, FileComplaintRequest, ComplaintHistory, ComplaintSlaConfig } from './models/complaint.model';

/**
 * Complaints service.
 * Calls the backend /v2/complaints endpoints.
 * Capability-gated on `complaint` flag; `GET /v2/complaint-health`
 * must 200 before the menu renders.
 */
@Injectable({
  providedIn: 'root'
})
export class ComplaintsService {
  private http = inject(HttpClient);

  /**
   * Get complaints list, optionally filtered by status.
   * @param status Optional status filter (OPEN, ASSIGNED, ESCALATED, RESOLVED, CLOSED)
   */
  getComplaints(status?: string): Observable<Complaint[]> {
    const params = status ? new HttpParams().set('status', status) : undefined;
    return this.http.get<Complaint[]>('/v2/complaints', { params });
  }

  /**
   * Get a single complaint by ID.
   * @param id Complaint ID
   */
  getComplaint(id: number): Observable<Complaint> {
    return this.http.get<Complaint>(`/v2/complaints/${id}`);
  }

  /**
   * File a new consumer complaint.
   * @param request Complaint filing request
   */
  fileComplaint(request: FileComplaintRequest): Observable<{ resourceId: number; rollbackTransaction: boolean }> {
    return this.http.post<{ resourceId: number; rollbackTransaction: boolean }>('/v2/complaints', request);
  }

  /**
   * Get complaint history (audit trail of status transitions).
   * @param id Complaint ID
   */
  getComplaintHistory(id: number): Observable<ComplaintHistory[]> {
    return this.http.get<ComplaintHistory[]>(`/v2/complaints/${id}/history`);
  }

  /**
   * Get SLA configuration for complaint types.
   */
  getSlaConfig(): Observable<ComplaintSlaConfig[]> {
    return this.http.get<ComplaintSlaConfig[]>('/v2/complaints/sla-config');
  }

  /**
   * Complaint health endpoint for menu gating.
   */
  complaintHealth(): Observable<{ module: string; status: string }> {
    return this.http.get<{ module: string; status: string }>('/v2/complaint-health');
  }
}
