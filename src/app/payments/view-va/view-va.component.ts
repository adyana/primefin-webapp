/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewChild,
  inject,
  DestroyRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import {
  MatTableDataSource,
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { take } from 'rxjs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Shared Page Standard */
import { PageToolbarComponent } from '../../shared/page-toolbar/page-toolbar.component';
import { StatusPillComponent } from '../../shared/status-pill/status-pill.component';
import { AccountHeaderComponent } from '../../shared/account-header/account-header.component';

/** Custom Services */
import { PaymentsService } from '../payments.service';

/**
 * Virtual account detail: header, close action and matched inbound
 * payments with fee/net split.
 */
@Component({
  selector: 'mifosx-view-va',
  templateUrl: './view-va.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    RouterLink,
    FaIconComponent,
    PageToolbarComponent,
    StatusPillComponent,
    AccountHeaderComponent,
    MatCard,
    MatCardContent,
    MatButton,
    MatIconButton,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    MatIcon,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewVaComponent implements AfterViewInit {
  private route = inject(ActivatedRoute);
  private paymentsService = inject(PaymentsService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  /** VA data from the resolver (undefined when the id is unknown). */
  vaData: any;

  transactionsDataSource = new MatTableDataSource<any>([]);
  transactionColumns: string[] = [
    'order',
    'amount',
    'feeAmount',
    'netAmount'
  ];

  /** Paginator for transactions table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { va: any }) => {
      this.vaData = data.va;
      if (this.vaData) {
        this.loadTransactions();
      }
    });
  }

  ngAfterViewInit(): void {
    this.transactionsDataSource.paginator = this.paginator;
  }

  filterTransactions(text: string): void {
    this.transactionsDataSource.filter = (text || '').trim().toLowerCase();
    if (this.transactionsDataSource.paginator) {
      this.transactionsDataSource.paginator.firstPage();
    }
  }

  /**
   * Closes the VA, then reloads.
   */
  close(): void {
    this.paymentsService
      .closeVa(this.vaData.id)
      .pipe(take(1))
      .subscribe(() => {
        this.paymentsService
          .getVas()
          .pipe(take(1))
          .subscribe((vas: any) => {
            const found = (Array.isArray(vas) ? vas : []).find((va: any) => va.id === this.vaData.id);
            this.vaData = found ?? this.vaData;
            this.loadTransactions();
          });
      });
  }

  private loadTransactions(): void {
    this.paymentsService
      .getVaTransactions(this.vaData.id)
      .pipe(take(1))
      .subscribe((txns: any) => {
        this.transactionsDataSource.data = Array.isArray(txns) ? txns : [];
        this.cdr.markForCheck();
      });
  }
}
