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
import { ActivatedRoute } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatCheckbox } from '@angular/material/checkbox';
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

/** rxjs Imports */
import { catchError, of, take } from 'rxjs';

/** Custom Services */
import { PaymentsService } from '../payments.service';

/**
 * Reconciliation matching board: auto-match rules with create/edit and the
 * run history. Sweeps mark breaks MATCHED with evidence; closing stays a
 * human decision on the breaks board.
 */
@Component({
  selector: 'mifosx-payment-matching',
  templateUrl: './matching.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ReactiveFormsModule,
    FaIconComponent,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatCheckbox,
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
export class PaymentMatchingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private paymentsService = inject(PaymentsService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  rulesDataSource = new MatTableDataSource<any>([]);
  ruleColumns: string[] = [
    'code',
    'matchType',
    'priority',
    'toleranceAmount',
    'maxAmount',
    'enabled',
    'actions'
  ];

  runsDataSource = new MatTableDataSource<any>([]);
  runColumns: string[] = [
    'startedOn',
    'status',
    'detail'
  ];

  /** Rule selected for editing (null = create form instead). */
  selectedRule: any = null;
  /** Form visibility; the board starts with the form hidden. */
  showForm = false;
  ruleForm: FormGroup = this.formBuilder.group({
    code: [''],
    matchType: [
      'LATE_ORDER',
      Validators.required
    ],
    priority: [
      100,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],
    toleranceAmount: [null],
    maxAmount: [null],
    enabled: [true]
  });

  matchTypes: string[] = [
    'LATE_ORDER',
    'STALE_SETTLED',
    'AMOUNT_TOLERANCE'
  ];

  ngOnInit(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { rules: any }) => {
      this.rulesDataSource.data = Array.isArray(data.rules) ? data.rules : [];
    });
    this.reloadRuns();
  }

  selectForCreate(): void {
    this.selectedRule = null;
    this.ruleForm.reset({
      code: '',
      matchType: 'LATE_ORDER',
      priority: 100,
      toleranceAmount: null,
      maxAmount: null,
      enabled: true
    });
    this.showForm = true;
    this.cdr.markForCheck();
  }

  selectForEdit(ruleRow: any): void {
    this.selectedRule = ruleRow;
    this.ruleForm.reset({
      code: ruleRow.code,
      matchType: ruleRow.matchType,
      priority: ruleRow.priority,
      toleranceAmount: ruleRow.toleranceAmount,
      maxAmount: ruleRow.maxAmount,
      enabled: ruleRow.enabled
    });
    this.showForm = true;
    this.cdr.markForCheck();
  }

  cancelForm(): void {
    this.selectedRule = null;
    this.showForm = false;
    this.cdr.markForCheck();
  }

  submit(): void {
    const raw = this.ruleForm.getRawValue();
    const call = this.selectedRule
      ? this.paymentsService.updateMatchRule(this.selectedRule.id, raw)
      : this.paymentsService.createMatchRule(raw);
    call.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.selectedRule = null;
      this.showForm = false;
      this.reloadRules();
    });
  }

  delete(ruleRow: any): void {
    this.paymentsService
      .deleteMatchRule(ruleRow.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reloadRules());
  }

  runNow(): void {
    this.paymentsService
      .runMatch()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reloadRuns());
  }

  private reloadRules(): void {
    this.paymentsService
      .getMatchRules()
      .pipe(
        take(1),
        catchError(() => of([]))
      )
      .subscribe((rules: any) => {
        this.rulesDataSource.data = Array.isArray(rules) ? rules : [];
        this.cdr.markForCheck();
      });
  }

  private reloadRuns(): void {
    this.paymentsService
      .getMatchRuns()
      .pipe(
        take(1),
        catchError(() => of([]))
      )
      .subscribe((runs: any) => {
        this.runsDataSource.data = Array.isArray(runs) ? runs : [];
        this.cdr.markForCheck();
      });
  }
}
