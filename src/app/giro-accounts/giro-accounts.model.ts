/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export interface GiroAccount {
  id: number;
  accountNo: string;
  clientId: number;
  clientName: string;
  productId: number;
  productName: string;
  currencyCode: string;
  balance: number;
  availableBalance: number;
  minBalance: number;
  monthlyFee: number;
  feeWaiverMinBalance?: number;
  chequeBookEnabled: boolean;
  chequeLeavesPerBook: number;
  nextChequeNumber: number;
  chequeBooksIssued: number;
  bilyetGiroEnabled: boolean;
  giroType: string;
  status: string;
  openedDate: string;
  closedDate?: string;
  createdOn: string;
  createdBy: number;
  lastModifiedOn?: string;
  lastModifiedBy?: number;
}

export interface GiroAccountData {
  pageItems: GiroAccount[];
  totalFilteredRecords: number;
}

export interface GiroAccountDetail extends GiroAccount {
  transactions?: GiroTransaction[];
  chequeBooks?: ChequeBook[];
  bilyetGiros?: BilyetGiro[];
}

export interface GiroTransaction {
  id: number;
  accountId: number;
  type: string;
  amount: number;
  runningBalance: number;
  date: string;
  description?: string;
}

export interface ChequeBook {
  id: number;
  accountId: number;
  startNumber: number;
  endNumber: number;
  leavesPerBook: number;
  issuedDate: string;
  status: string;
}

export interface BilyetGiro {
  id: number;
  accountId: number;
  payeeName: string;
  amount: number;
  dueDate: string;
  status: string;
}
