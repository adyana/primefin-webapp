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
 * Suspicious-case queue: rule-opened findings with propose/approve/close
 * disposition. Filing an STR needs a different approver than the maker.
 */
@Component({
  selector: 'mifosx-aml-cases',
  templateUrl: './aml-cases.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ReactiveFormsModule,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
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
export class AmlCasesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private complianceService = inject(ComplianceService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  filterForm: FormGroup = this.formBuilder.group({ status: ['OPEN'] });

  casesDataSource = new MatTableDataSource<any>([]);
  caseColumns: string[] = [
    'rule',
    'subjectRef',
    'businessDate',
    'status',
    'actions'
  ];

  /** Case selected for propose/close (null = no decision form). */
  selectedCase: any = null;
  decisionForm: FormGroup = this.formBuilder.group({
    reason: [
      '',
      Validators.required
    ]
  });

  statuses: string[] = [
    'OPEN',
    'PROPOSED_STR',
    'STR_FILED',
    'CLOSED_NO_ACTION'
  ];

  ngOnInit(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { cases: any }) => {
      this.casesDataSource.data = Array.isArray(data.cases) ? data.cases : [];
    });
    this.filterForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.reload());
  }

  selectForDecision(caseRow: any): void {
    this.selectedCase = caseRow;
    this.decisionForm.reset({ reason: '' });
    this.cdr.markForCheck();
  }

  propose(): void {
    this.complianceService
      .proposeCase(this.selectedCase.id, this.decisionForm.value.reason)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.selectedCase = null;
        this.reload();
      });
  }

  approve(): void {
    this.complianceService
      .approveCase(this.selectedCase.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.selectedCase = null;
        this.reload();
      });
  }

  close(): void {
    this.complianceService
      .closeCase(this.selectedCase.id, this.decisionForm.value.reason)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.selectedCase = null;
        this.reload();
      });
  }

  private reload(): void {
    const status = this.filterForm.value.status === 'ALL' ? undefined : this.filterForm.value.status;
    this.complianceService
      .getAmlCases(status)
      .pipe(
        take(1),
        catchError(() => of([]))
      )
      .subscribe((cases: any) => {
        this.casesDataSource.data = Array.isArray(cases) ? cases : [];
        this.cdr.markForCheck();
      });
  }
}
