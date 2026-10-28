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
import { DepositoAccountDetail, DepositoTransaction } from '../deposito-accounts.model';

/** Shared Imports */
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { MatTooltip } from '@angular/material/tooltip';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

/**
 * Deposito Account Detail component.
 * Shows detailed view of a deposito account with tabs for General, Transactions, etc.
 */
@Component({
  selector: 'mifosx-deposito-account-detail',
  templateUrl: './deposito-account-detail.component.html',
  styleUrls: ['./deposito-account-detail.component.scss'],
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTooltip,
    FaIconComponent,
    DatePipe
  ]
})
export class DepositoAccountDetailComponent implements OnInit {

  /** Deposito account data from resolver */
  depositoAccount!: DepositoAccountDetail;
  /** Transactions data */
  transactions: DepositoTransaction[] = [];
  /** Loading state */
  isLoading = false;
  /** Selected tab index */
  selectedTabIndex = 0;

  /** Displayed columns for transactions table */
  txnDisplayedColumns: string[] = ['date', 'type', 'amount', 'runningBalance', 'description'];

  /** Injected services */
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private settingsService = inject(SettingsService);
  private datesService = inject(Dates);

  /**
   * Initialize component with resolved data
   */
  ngOnInit() {
    this.route.data.subscribe((data: { depositoAccount: DepositoAccountDetail }) => {
      this.depositoAccount = data.depositoAccount;
      this.transactions = data.depositoAccount.transactions || [];
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
    this.router.navigate(['/deposito-accounts']);
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
      'MATURED': 'status-matured',
      'RENEWED': 'status-renewed',
      'CLOSED': 'status-closed',
      'EARLY_WITHDRAWN': 'status-early-withdrawn',
      'PARTIAL_WITHDRAWN': 'status-partial-withdrawn'
    };
    return statusMap[status] || 'status-unknown';
  }

  /**
   * Get transaction type badge class
   */
  getTransactionTypeClass(type: string): string {
    const typeMap: Record<string, string> = {
      'OPENING': 'txn-opening',
      'INTEREST_POSTING': 'txn-interest',
      'INTEREST_PAYMENT': 'txn-interest-payment',
      'PRINCIPAL_PAYMENT': 'txn-principal',
      'EARLY_WITHDRAWAL': 'txn-early-withdrawal',
      'MATURITY': 'txn-maturity',
      'RENEWAL': 'txn-renewal',
      'PARTIAL_WITHDRAWAL': 'txn-partial-withdrawal',
      'PENALTY': 'txn-penalty',
      'TAX': 'txn-tax'
    };
    return typeMap[type] || 'txn-unknown';
  }
}
