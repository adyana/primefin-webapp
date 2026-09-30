/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject, DestroyRef } from '@angular/core';
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
 * Fraud-SLA view: holds past the 24h reporting SLA, with the idempotent
 * sweep that raises one recon break per breach.
 */
@Component({
  selector: 'mifosx-payment-fraud-sla',
  templateUrl: './fraud-sla.component.html',
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
export class PaymentFraudSlaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private paymentsService = inject(PaymentsService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  breachesDataSource = new MatTableDataSource<any>([]);
  breachColumns: string[] = ['orderId', 'key', 'rail', 'amount', 'heldHours', 'reason'];
  sweepResult: string | null = null;

  ngOnInit(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { breaches: any }) => {
      this.breachesDataSource.data = Array.isArray(data.breaches) ? data.breaches : [];
    });
  }

  sweep(): void {
    this.paymentsService
      .sweepFraudSla()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.sweepResult = 'Sweep filed — breached holds now carry recon breaks.';
        this.cdr.markForCheck();
        this.reload();
      });
  }

  private reload(): void {
    this.paymentsService
      .getFraudSla()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((breaches: any) => {
        this.breachesDataSource.data = Array.isArray(breaches) ? breaches : [];
        this.cdr.markForCheck();
      });
  }
}
