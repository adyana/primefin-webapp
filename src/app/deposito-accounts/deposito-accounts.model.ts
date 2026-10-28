/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export interface DepositoAccount {
  id: number;
  accountNo: string;
  clientId: number;
  clientName: string;
  productId: number;
  productName: string;
  currencyCode: string;
  principalAmount: number;
  interestRatePct: number;
  tenorMonths: number;
  interestPaymentFrequency: string;
  interestPaymentAccountId?: number;
  openedDate: string;
  maturityDate: string;
  lastInterestCalcDate?: string;
  nextInterestPaymentDate?: string;
  autoRenewalOption?: string;
  renewalCount: number;
  maxRenewals?: number;
  status: string;
  closureReason?: string;
  isSharia: boolean;
  nisbahBankPct?: number;
  nisbahCustomerPct?: number;
  profitSharingFrequency?: string;
  lastProfitCalcDate?: string;
  nextProfitPaymentDate?: string;
  createdOn: string;
  createdBy: number;
  lastModifiedOn?: string;
  lastModifiedBy?: number;
}

export interface DepositoAccountData {
  pageItems: DepositoAccount[];
  totalFilteredRecords: number;
}

export interface DepositoAccountDetail extends DepositoAccount {
  transactions?: DepositoTransaction[];
  interestPosted?: number;
  interestAccrued?: number;
  penaltyAccrued?: number;
}

export interface DepositoTransaction {
  id: number;
  accountId: number;
  type: string;
  amount: number;
  runningBalance: number;
  date: string;
  description?: string;
}
