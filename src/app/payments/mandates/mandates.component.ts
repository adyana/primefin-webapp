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
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
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
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Custom Services */
import { PaymentsService } from '../payments.service';

/**
 * DDT autopay mandates board: every mandate with collect/suspend/revoke
 * actions. Collect books one PENDING DDT order and advances next-due.
 */
@Component({
  selector: 'mifosx-payment-mandates',
  templateUrl: './mandates.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ReactiveFormsModule,
    RouterLink,
    FaIconComponent,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
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
export class PaymentMandatesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private paymentsService = inject(PaymentsService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  mandatesDataSource = new MatTableDataSource<any>([]);
  mandateColumns: string[] = [
    'reference',
    'debtorAccount',
    'creditorAccount',
    'maxAmount',
    'frequency',
    'status',
    'nextDueOn',
    'actions'
  ];

  /** Row selected for collection (null = no collect form). */
  selectedMandate: any = null;
  collectForm: FormGroup = this.formBuilder.group({
    amount: [
      null,
      [
        Validators.required,
        Validators.min(1)
      ]
    ]
  });

  ngOnInit(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { mandates: any }) => {
      this.mandatesDataSource.data = Array.isArray(data.mandates) ? data.mandates : [];
    });
  }

  selectForCollect(mandateRow: any): void {
    this.selectedMandate = mandateRow;
    this.collectForm.reset({ amount: mandateRow.maxAmount });
    this.cdr.markForCheck();
  }

  collect(): void {
    this.paymentsService
      .collectMandate(this.selectedMandate.id, this.collectForm.value.amount)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.selectedMandate = null;
        this.reload();
      });
  }

  suspend(mandateRow: any): void {
    this.paymentsService
      .suspendMandate(mandateRow.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  revoke(mandateRow: any): void {
    this.paymentsService
      .revokeMandate(mandateRow.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  private reload(): void {
    this.paymentsService
      .getMandates()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((mandates: any) => {
        this.mandatesDataSource.data = Array.isArray(mandates) ? mandates : [];
        this.cdr.markForCheck();
      });
  }
}
