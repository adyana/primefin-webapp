/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  inject,
  DestroyRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatPaginator } from '@angular/material/paginator';
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
import { catchError, of } from 'rxjs';

/** Custom Services */
import { CorporateService } from '../corporate.service';
import { CorporateBatchService } from '../corporate-batch.service';

/**
 * Payroll board: corporate picker, roster with add/activate/deactivate,
 * salary batch creation per period, salary batch history and the
 * schedule runner.
 */
@Component({
  selector: 'mifosx-corporate-payroll',
  templateUrl: './payroll.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ReactiveFormsModule,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
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
    MatButton,
    MatPaginator
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CorporatePayrollComponent implements OnInit {
  private corporateService = inject(CorporateService);
  private batchService = inject(CorporateBatchService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  pickerForm: FormGroup = this.formBuilder.group({ corporateId: [
      null,
      Validators.required
    ] });
  employeeForm: FormGroup = this.formBuilder.group({
    employeeRef: [
      '',
      Validators.required
    ],
    account: [
      '',
      Validators.required
    ],
    bank: [''],
    name: [''],
    amount: [
      null,
      [
        Validators.required,
        Validators.min(1)
      ]
    ]
  });
  salaryForm: FormGroup = this.formBuilder.group({
    period: [
      '',
      [
        Validators.required,
        Validators.pattern('^[0-9]{6}$')
      ]
    ],
    rail: [
      'ICT',
      Validators.required
    ]
  });

  corporates: any[] = [];
  rosterDataSource = new MatTableDataSource<any>([]);
  rosterColumns: string[] = [
    'employee',
    'account',
    'name',
    'amount',
    'active',
    'actions'
  ];
  batchesDataSource = new MatTableDataSource<any>([]);
  batchColumns: string[] = [
    'reference',
    'period',
    'total',
    'status'
  ];

  /** Last schedule-run counts (null = no run yet this session). */
  runResult: any = null;

  /** Paginators for the roster and salary batch tables. */
  @ViewChild('rosterPaginator') rosterPaginator: MatPaginator;
  @ViewChild('payrollPaginator') payrollPaginator: MatPaginator;

  ngOnInit(): void {
    this.corporateService
      .getCorporates('ACTIVE')
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of([]))
      )
      .subscribe((corporates: any) => {
        this.corporates = Array.isArray(corporates) ? corporates : [];
        this.cdr.markForCheck();
      });
    this.pickerForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.reload());
  }

  addEmployee(): void {
    const corporateId = this.pickerForm.value.corporateId;
    if (!corporateId || !this.employeeForm.valid) {
      return;
    }
    this.batchService
      .addEmployee(corporateId, this.employeeForm.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.employeeForm.reset();
        this.reload();
      });
  }

  setEmployeeActive(row: any, active: boolean): void {
    this.batchService
      .setEmployeeActive(row.id, active)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  createSalary(): void {
    const corporateId = this.pickerForm.value.corporateId;
    if (!corporateId || !this.salaryForm.valid) {
      return;
    }
    this.batchService
      .createSalaryBatch(corporateId, this.salaryForm.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.salaryForm.reset({ rail: 'ICT' });
        this.reload();
      });
  }

  runSchedules(): void {
    this.batchService
      .runPayrollSchedules()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: any) => {
        this.runResult = result;
        this.reload();
      });
  }

  private reload(): void {
    const corporateId = this.pickerForm.value.corporateId;
    if (!corporateId) {
      return;
    }
    this.batchService
      .getRoster(corporateId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of([]))
      )
      .subscribe((roster: any) => {
        this.rosterDataSource.data = Array.isArray(roster) ? roster : [];
        if (this.rosterPaginator) {
          this.rosterDataSource.paginator = this.rosterPaginator;
        }
        this.cdr.markForCheck();
      });
    this.batchService
      .getBatches(undefined)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of([]))
      )
      .subscribe((batches: any) => {
        const rows = Array.isArray(batches) ? batches : [];
        this.batchesDataSource.data = rows.filter(
          (row: any) => row.kind === 'SALARY' && row.corporateId === corporateId
        );
        if (this.payrollPaginator) {
          this.batchesDataSource.paginator = this.payrollPaginator;
        }
        this.cdr.markForCheck();
      });
  }
}
