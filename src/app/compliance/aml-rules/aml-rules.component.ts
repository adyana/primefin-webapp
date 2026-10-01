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
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** rxjs Imports */
import { catchError, of, take } from 'rxjs';

/** Custom Services */
import { ComplianceService } from '../compliance.service';

/**
 * AML monitoring rules board: thresholds are data, so tuning never needs a
 * deploy. Disabled rules skip evaluation; the nightly sweep only runs
 * enabled ones.
 */
@Component({
  selector: 'mifosx-aml-rules',
  templateUrl: './aml-rules.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ReactiveFormsModule,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
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
export class AmlRulesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private complianceService = inject(ComplianceService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  rulesDataSource = new MatTableDataSource<any>([]);
  ruleColumns: string[] = [
    'code',
    'ruleType',
    'thresholdAmount',
    'windowDays',
    'countThreshold',
    'enabled',
    'actions'
  ];

  /** Rule selected for retuning (null = no edit form). */
  selectedRule: any = null;
  editForm: FormGroup = this.formBuilder.group({
    thresholdAmount: [null],
    windowDays: [null],
    countThreshold: [null],
    enabled: [true]
  });

  ngOnInit(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { rules: any }) => {
      this.rulesDataSource.data = Array.isArray(data.rules) ? data.rules : [];
    });
  }

  selectForEdit(ruleRow: any): void {
    this.selectedRule = ruleRow;
    this.editForm.reset({
      thresholdAmount: ruleRow.thresholdAmount,
      windowDays: ruleRow.windowDays,
      countThreshold: ruleRow.countThreshold,
      enabled: ruleRow.enabled
    });
    this.cdr.markForCheck();
  }

  save(): void {
    this.complianceService
      .updateAmlRule(this.selectedRule.id, this.editForm.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.selectedRule = null;
        this.reload();
      });
  }

  cancelEdit(): void {
    this.selectedRule = null;
    this.cdr.markForCheck();
  }

  private reload(): void {
    this.complianceService
      .getAmlRules()
      .pipe(
        take(1),
        catchError(() => of([]))
      )
      .subscribe((rules: any) => {
        this.rulesDataSource.data = Array.isArray(rules) ? rules : [];
        this.cdr.markForCheck();
      });
  }
}
