/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
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
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatButton,
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewVaComponent {
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

  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { va: any }) => {
      this.vaData = data.va;
      if (this.vaData) {
        this.loadTransactions();
      }
    });
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
