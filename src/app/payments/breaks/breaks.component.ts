/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
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
import { MatButton } from '@angular/material/button';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Custom Services */
import { PaymentsService } from '../payments.service';

/**
 * Reconciliation breaks board: every OPEN break with a human close action.
 * EOD rule: this board must be empty before sign-off.
 */
@Component({
  selector: 'mifosx-payment-breaks',
  templateUrl: './breaks.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
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
    MatButton
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentBreaksComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private paymentsService = inject(PaymentsService);
  private destroyRef = inject(DestroyRef);

  breaksDataSource = new MatTableDataSource<any>([]);
  breakColumns: string[] = ['id', 'order', 'expected', 'actual', 'reason', 'status', 'actions'];

  ngOnInit(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { breaks: any }) => {
      this.breaksDataSource.data = Array.isArray(data.breaks) ? data.breaks : [];
    });
  }

  close(breakRow: any): void {
    this.paymentsService
      .closeBreak(breakRow.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  private reload(): void {
    this.paymentsService
      .getBreaks('OPEN')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((breaks: any) => {
        this.breaksDataSource.data = Array.isArray(breaks) ? breaks : [];
      });
  }
}
