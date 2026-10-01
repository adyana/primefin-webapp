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
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
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
  styleUrls: ['./breaks.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
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
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  filterForm: FormGroup = this.formBuilder.group({ status: ['OPEN'] });

  breaksDataSource = new MatTableDataSource<any>([]);
  breakColumns: string[] = [
    'id',
    'order',
    'expected',
    'actual',
    'reason',
    'status',
    'actions'
  ];

  ngOnInit(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { breaks: any }) => {
      this.breaksDataSource.data = Array.isArray(data.breaks) ? data.breaks : [];
    });
    this.filterForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.reload());
  }

  close(breakRow: any): void {
    this.paymentsService
      .closeBreak(breakRow.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  runMatch(): void {
    this.paymentsService
      .runMatch()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  private reload(): void {
    const status = this.filterForm.value.status === 'ALL' ? undefined : this.filterForm.value.status;
    this.paymentsService
      .getBreaks(status)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((breaks: any) => {
        this.breaksDataSource.data = Array.isArray(breaks) ? breaks : [];
        this.cdr.markForCheck();
      });
  }
}
