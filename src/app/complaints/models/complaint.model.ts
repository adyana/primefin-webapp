/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0.
 */

/**
 * Complaint domain model.
 * Returned by /v2/complaints endpoints.
 */
export interface Complaint {
  id: number;
  clientId: number;
  loanId?: number;
  complaintType: string;
  subject: string;
  description: string;
  channel: string;
  status: string;
  priority: string;
  slaDeadline: string;
  resolvedAt?: string;
  assigneeId?: number;
  createdBy: number;
  createdOn: string;
  new?: boolean;
}

export interface ComplaintHistory {
  id: number;
  complaintId: number;
  fromStatus: string;
  toStatus: string;
  actorId: number;
  notes: string;
  createdOn: string;
}

export interface ComplaintSlaConfig {
  id: number;
  complaintType: string;
  slaHours: number;
  createdBy: number;
  createdOn: string;
}

export interface FileComplaintRequest {
  clientId: number;
  loanId?: number;
  complaintType: string;
  subject: string;
  description: string;
  channel?: string;
  priority?: string;
}

export interface AssignComplaintRequest {
  assigneeId: number;
}

export interface ResolveComplaintRequest {
  notes: string;
}

export interface EscalateComplaintRequest {
  notes: string;
}
