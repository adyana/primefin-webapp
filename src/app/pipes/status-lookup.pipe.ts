/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'statusLookup' })
export class StatusLookupPipe implements PipeTransform {
  transform(status: string): string {
    const cssClassNameLookup = {
      true: 'status-active',
      false: 'status-deleted',
      Active: 'status-active',
      Block: 'status-block',
      'charges.StatusType.active.true': 'status-active',
      'loanStatusType.submitted.and.pending.approval': 'status-pending',
      'loanStatusType.approved': 'status-approved',
      'loanStatusType.active': 'status-active',
      'loanStatusType.overpaid': 'status-overpaid',
      'loanStatusType.chargeoff': 'status-chargeoff',
      'loanStatusType.activeOverdue': 'status-active-overdue',
      'loanSubStatusType.contractTermination': 'subStatus-contract-termination',
      'savingsAccountStatusType.submitted.and.pending.approval': 'status-pending',
      'savingsAccountStatusType.approved': 'status-approved',
      'savingsAccountStatusType.active': 'status-active',
      'savingsAccountStatusType.activeInactive': 'status-active-overdue',
      'savingsAccountStatusType.activeDormant': 'status-active-overdue',
      'savingsAccountStatusType.matured': 'status-matured',
      'shareAccountStatusType.submitted.and.pending.approval': 'status-pending',
      'shareAccountStatusType.approved': 'status-approved',
      'shareAccountStatusType.active': 'status-active',
      'shareAccountStatusType.rejected': 'status-rejected',
      'loanProduct.active': 'status-active',
      'loanProduct.inActive': 'status-inactive',
      'clientStatusType.pending': 'status-pending',
      'clientStatusType.closed': 'status-closed',
      'clientStatusType.rejected': 'status-rejected', // write
      'clientStatusType.withdraw': 'status-withdraw', // write
      'clientStatusType.active': 'status-active',
      'clientStatusType.submitted.and.pending.approval': 'status-pending',
      'clientStatusType.approved': 'status-approved',
      'clientStatusType.transfer.in.progress': 'status-transfer-progress', // write
      'clientStatusType.transfer.on.hold': 'status-transfer-hold', // write
      'groupingStatusType.active': 'status-active',
      'groupingStatusType.pending': 'status-pending',
      'groupingStatusType.submitted.and.pending.approval': 'status-pending',
      'groupingStatusType.approved': 'status-approved',
      'smsCampaignStatus.active': 'status-active',
      'smsCampaignStatus.pending': 'status-pending',
      'smsCampaignStatus.closed': 'status-closed',
      'purchasedSharesStatusType.applied': 'status-pending',
      // PrimeFin module statuses (raw uppercase vocabularies).
      ACTIVE: 'status-active',
      APPROVED: 'status-approved',
      COMPLETED: 'status-active',
      MATCHED: 'status-active',
      SETTLED: 'status-active',
      POSTED: 'status-active',
      SUCCESS: 'status-active',
      OK: 'status-active',
      PASS: 'status-active',
      KEPT: 'status-active',
      RECOVERED: 'status-active',
      PENDING: 'status-pending',
      SUBMITTED: 'status-pending',
      DRAFT: 'status-pending',
      OPEN: 'status-pending',
      PROPOSED: 'status-pending',
      PROPOSED_STR: 'status-pending',
      PROMISED: 'status-pending',
      EXECUTING: 'status-pending',
      PARTIAL: 'status-pending',
      WATCH: 'status-pending',
      REJECTED: 'status-rejected',
      FAILED: 'status-rejected',
      BREACH: 'status-rejected',
      OVERDUE: 'status-rejected',
      ESCALATED: 'status-rejected',
      LEGAL: 'status-rejected',
      REFUSED: 'status-rejected',
      BROKEN: 'status-rejected',
      RETURNED: 'status-rejected',
      SUSPENDED: 'status-rejected',
      CLOSED: 'status-closed',
      CLOSED_NO_ACTION: 'status-closed',
      MATURED: 'status-matured',
      RESOLVED: 'status-closed',
      CANCELLED: 'status-closed',
      WRITTEN_OFF: 'status-closed',
      STR_FILED: 'status-closed',
      INACTIVE: 'status-inactive',
      NOT_FOUND: 'status-unknown'
    };
    return cssClassNameLookup[status as keyof typeof cssClassNameLookup] ?? 'status-unknown';
  }
}
