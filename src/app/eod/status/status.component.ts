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
  OnDestroy,
  OnInit,
  inject,
  DestroyRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
  MatCell
} from '@angular/material/table';
import { MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** rxjs Imports */
import { catchError, of } from 'rxjs';

/** Custom Services */
import { EodService } from '../eod.service';

/** Shared Page Standard */
import { StatusPillComponent } from '../../shared/status-pill/status-pill.component';

/**
 * EOD cockpit status pane: business dates, EOD job health with last
 * runs, catch-up watermarks and module poller summaries.
 */
@Component({
  selector: 'mifosx-eod-status',
  templateUrl: './status.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    StatusPillComponent,
    ReactiveFormsModule,
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
export class EodStatusComponent implements OnInit, OnDestroy {
  private eodService = inject(EodService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  /** Status panes (null = not loaded yet). */
  status: any = null;

  runForm: FormGroup = this.formBuilder.group({
    targetDate: [''],
    maxDays: [null]
  });

  /** Dry-run plan preview (null = no preview yet). */
  plan: any = null;

  /** Tracked run snapshot (null = nothing started this session). */
  run: any = null;

  private poller: ReturnType<typeof setInterval> | null = null;

  jobsDataSource = new MatTableDataSource<any>([]);
  jobColumns: string[] = [
    'job',
    'active',
    'running',
    'lastStatus',
    'lastEnd'
  ];
  schedulesDataSource = new MatTableDataSource<any>([]);
  scheduleColumns: string[] = [
    'code',
    'action',
    'enabled',
    'lastStatus'
  ];

  ngOnInit(): void {
    this.reload();
  }

  ngOnDestroy(): void {
    if (this.poller) {
      clearInterval(this.poller);
    }
  }

  previewPlan(): void {
    const { targetDate, maxDays } = this.runForm.value;
    this.eodService
      .getRunPlan(targetDate || undefined, maxDays || undefined)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of(null))
      )
      .subscribe((plan: any) => {
        this.plan = plan;
        this.cdr.markForCheck();
      });
  }

  startRun(): void {
    const { targetDate, maxDays } = this.runForm.value;
    this.eodService
      .startRun({ targetDate: targetDate || null, maxDays: maxDays || null })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((started: any) => {
        this.track(started.runId);
      });
  }

  private track(runId: string): void {
    if (this.poller) {
      clearInterval(this.poller);
    }
    const fetch = () => {
      this.eodService
        .getRun(runId)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          catchError(() => of(null))
        )
        .subscribe((run: any) => {
          this.run = run;
          if (run && run.status !== 'RUNNING' && this.poller) {
            clearInterval(this.poller);
            this.poller = null;
          }
          this.cdr.markForCheck();
        });
    };
    fetch();
    this.poller = setInterval(fetch, 15000);
  }

  reload(): void {
    this.eodService
      .getStatus()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of(null))
      )
      .subscribe((status: any) => {
        this.status = status;
        this.jobsDataSource.data = status && Array.isArray(status.jobs) ? status.jobs : [];
        this.schedulesDataSource.data =
          status && status.modules && Array.isArray(status.modules.schedules) ? status.modules.schedules : [];
        this.cdr.markForCheck();
      });
  }
}
