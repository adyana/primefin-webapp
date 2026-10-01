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

/** Custom Services */
import { PaymentsService } from '../payments.service';

/**
 * Automation schedules board: every schedule with enable/interval editing,
 * manual Run-now and the per-schedule run history. The poller executes
 * enabled schedules whose interval elapsed; this page is the manual
 * override for whatever reason ops needs it.
 */
@Component({
  selector: 'mifosx-payment-schedules',
  templateUrl: './schedules.component.html',
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
export class PaymentSchedulesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private paymentsService = inject(PaymentsService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  schedulesDataSource = new MatTableDataSource<any>([]);
  scheduleColumns: string[] = [
    'code',
    'action',
    'rail',
    'enabled',
    'intervalMinutes',
    'lastRunOn',
    'actions'
  ];

  runsDataSource = new MatTableDataSource<any>([]);
  runColumns: string[] = [
    'startedOn',
    'status',
    'detail'
  ];

  /** Schedule selected for editing (null = no edit form). */
  selectedSchedule: any = null;
  editForm: FormGroup = this.formBuilder.group({
    rail: [''],
    amountOverride: [null],
    enabled: [false],
    intervalMinutes: [
      60,
      [
        Validators.required,
        Validators.min(1)
      ]
    ]
  });

  /** Schedule whose runs are shown below (null = none selected). */
  runsFor: any = null;

  ngOnInit(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { schedules: any }) => {
      this.schedulesDataSource.data = Array.isArray(data.schedules) ? data.schedules : [];
    });
  }

  selectForEdit(scheduleRow: any): void {
    this.selectedSchedule = scheduleRow;
    this.editForm.reset({
      rail: scheduleRow.rail ?? '',
      amountOverride: scheduleRow.amountOverride,
      enabled: scheduleRow.enabled,
      intervalMinutes: scheduleRow.intervalMinutes
    });
    this.cdr.markForCheck();
  }

  save(): void {
    const raw = this.editForm.getRawValue();
    this.paymentsService
      .updateSchedule(this.selectedSchedule.id, {
        rail: raw.rail,
        amountOverride: raw.amountOverride,
        enabled: raw.enabled,
        intervalMinutes: raw.intervalMinutes
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.selectedSchedule = null;
        this.reload();
      });
  }

  runNow(scheduleRow: any): void {
    this.paymentsService
      .runSchedule(scheduleRow.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.showRuns(scheduleRow);
        this.reload();
      });
  }

  showRuns(scheduleRow: any): void {
    this.runsFor = scheduleRow;
    this.paymentsService
      .getScheduleRuns(scheduleRow.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((runs: any) => {
        this.runsDataSource.data = Array.isArray(runs) ? runs : [];
        this.cdr.markForCheck();
      });
  }

  private reload(): void {
    this.paymentsService
      .getSchedules()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((schedules: any) => {
        this.schedulesDataSource.data = Array.isArray(schedules) ? schedules : [];
        this.cdr.markForCheck();
      });
  }
}
