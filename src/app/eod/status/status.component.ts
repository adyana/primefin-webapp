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
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
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

/**
 * EOD cockpit status pane: business dates, EOD job health with last
 * runs, catch-up watermarks and module poller summaries.
 */
@Component({
  selector: 'mifosx-eod-status',
  templateUrl: './status.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCard,
    MatCardTitle,
    MatCardContent,
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
export class EodStatusComponent implements OnInit {
  private eodService = inject(EodService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  /** Status panes (null = not loaded yet). */
  status: any = null;

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
