/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

/** Custom Models */
import { GiroAccountDetail, GiroTransaction } from '../giro-accounts.model';

/** Shared Imports */
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { MatTooltip } from '@angular/material/tooltip';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

/**
 * Giro Account Detail component.
 * Shows detailed view of a giro account with tabs for General, Transactions, Cheque Books, Bilyet Giro.
 */
@Component({
  selector: 'mifosx-giro-account-detail',
  templateUrl: './giro-account-detail.component.html',
  styleUrls: ['./giro-account-detail.component.scss'],
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTooltip,
    FaIconComponent,
    DatePipe
  ]
})
export class GiroAccountDetailComponent implements OnInit {

  /** Giro account data from resolver */
  giroAccount!: GiroAccountDetail;
  /** Transactions data */
  transactions: GiroTransaction[] = [];
  /** Cheque books data */
  chequeBooks: any[] = [];
  /** Bilyet giro data */
  bilyetGiros: any[] = [];
  /** Loading state */
  isLoading = false;
  /** Selected tab index */
  selectedTabIndex = 0;

  /** Displayed columns for transactions table */
  txnDisplayedColumns: string[] = ['date', 'type', 'amount', 'runningBalance', 'description'];

  /** Displayed columns for cheque books table */
  chequeBookDisplayedColumns: string[] = ['id', 'startNumber', 'endNumber', 'leavesPerBook', 'issuedDate', 'status'];

  /** Displayed columns for bilyet giro table */
  bilyetGiroDisplayedColumns: string[] = ['id', 'payeeName', 'amount', 'dueDate', 'status'];

  /** Injected services */
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private settingsService = inject(SettingsService);
  private datesService = inject(Dates);

  /**
   * Initialize component with resolved data
   */
  ngOnInit() {
    this.route.data.subscribe((data: { giroAccount: GiroAccountDetail }) => {
      this.giroAccount = data.giroAccount;
      this.transactions = data.giroAccount.transactions || [];
      this.chequeBooks = data.giroAccount.chequeBooks || [];
      this.bilyetGiros = data.giroAccount.bilyetGiros || [];
    });
  }

  /**
   * Handle tab change
   * @param event Tab change event
   */
  onTabChange(event: MatTabChangeEvent) {
    this.selectedTabIndex = event.index;
  }

  /**
   * Navigate back to list
   */
  goBack() {
    this.router.navigate(['/giro-accounts']);
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number, currencyCode: string): string {
    const decimalPlaces = Number(this.settingsService.decimals) || 2;
    const inMultiplesOf = 1;
    const displaySymbol = true;
    const code = currencyCode;

    const formattedAmount = (amount / inMultiplesOf).toFixed(decimalPlaces);
    return displaySymbol ? `${code} ${formattedAmount}` : formattedAmount;
  }

  /**
   * Format date for display
   */
  formatDate(date: string | Date): string {
    if (!date) return '';
    return this.datesService.formatDate(new Date(date), this.settingsService.dateFormat);
  }

  /**
   * Get status badge class
   */
  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'ACTIVE': 'status-active',
      'CLOSED': 'status-closed',
      'FROZEN': 'status-frozen',
      'DORMANT': 'status-dormant'
    };
    return statusMap[status] || 'status-unknown';
  }

  /**
   * Get giro type badge class
   */
  getGiroTypeClass(type: string): string {
    const typeMap: Record<string, string> = {
      'BIASA': 'type-biasa',
      'VALAS': 'type-valas',
      'WAR_KAT': 'type-war-kat'
    };
    return typeMap[type] || 'type-unknown';
  }

  /**
   * Get transaction type badge class
   */
  getTransactionTypeClass(type: string): string {
    const typeMap: Record<string, string> = {
      'OPENING': 'txn-opening',
      'DEPOSIT': 'txn-deposit',
      'WITHDRAWAL': 'txn-withdrawal',
      'TRANSFER_IN': 'txn-transfer-in',
      'TRANSFER_OUT': 'txn-transfer-out',
      'CHEQUE_CLEARING': 'txn-cheque',
      'CHEQUE_BOUNCED': 'txn-cheque-bounced',
      'FEE': 'txn-fee',
      'MONTHLY_FEE': 'txn-monthly-fee',
      'BILYET_GIRO': 'txn-bilyet-giro',
      'BILYET_GIRO_CLEARED': 'txn-bilyet-giro-cleared'
    };
    return typeMap[type] || 'type-unknown';
  }
}
