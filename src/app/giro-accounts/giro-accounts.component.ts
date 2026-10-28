/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

/** Custom Models */
import { GiroAccount, GiroAccountData } from './giro-accounts.model';

/** Custom Services */
import { GiroAccountsService } from './giro-accounts.service';

/** Shared Imports */
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { MatTooltip } from '@angular/material/tooltip';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

/**
 * Giro Accounts component.
 * Lists all giro accounts with pagination, sorting, and filtering.
 */
@Component({
  selector: 'mifosx-giro-accounts',
  templateUrl: './giro-accounts.component.html',
  styleUrls: ['./giro-accounts.component.scss'],
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltip,
    FaIconComponent
  ]
})
export class GiroAccountsComponent implements OnInit, OnDestroy {

  /** Columns displayed in the table */
  displayedColumns: string[] = [
    'accountNo',
    'clientName',
    'productName',
    'currencyCode',
    'balance',
    'availableBalance',
    'minBalance',
    'giroType',
    'status',
    'action'
  ];

  /** Data source for the table */
  dataSource = new MatTableDataSource<GiroAccount>([]);

  /** Paginator reference */
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  /** Sort reference */
  @ViewChild(MatSort) sort!: MatSort;

  /** Loading state */
  isLoading = false;
  /** Total elements for pagination */
  totalElements = 0;
  /** Page size options */
  pageSizeOptions = [10, 25, 50, 100];

  /** Destroy subject for subscription cleanup */
  private destroy$ = new Subject<void>();

  /** Injected services */
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private giroAccountsService = inject(GiroAccountsService);
  private settingsService = inject(SettingsService);
  private datesService = inject(Dates);

  /**
   * Initialize component and load data
   */
  ngOnInit() {
    this.loadGiroAccounts();
  }

  /**
   * Handle search from page toolbar
   * @param query Search query string
   */
  onSearch(query: string) {
    this.dataSource.filter = query.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Clean up subscriptions
   */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load giro accounts from API
   */
  loadGiroAccounts() {
    this.isLoading = true;
    this.giroAccountsService.getAllGiroAccounts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: GiroAccountData) => {
          this.dataSource.data = response.pageItems || [];
          this.totalElements = response.totalFilteredRecords || 0;
          this.isLoading = false;
          this.setupTable();
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  /**
   * Setup paginator and sort after data loads
   */
  setupTable() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Navigate to giro account detail view
   * @param giroAccount Giro account to view
   */
  viewGiroAccount(giroAccount: GiroAccount) {
    this.router.navigate(['/giro-accounts', giroAccount.id]);
  }

  /**
   * Format date for display
   * @param date Date to format
   * @returns Formatted date string
   */
  formatDate(date: string | Date): string {
    if (!date) return '';
    return this.datesService.formatDate(new Date(date), this.settingsService.dateFormat);
  }
}
