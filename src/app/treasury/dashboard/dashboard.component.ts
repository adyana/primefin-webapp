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
import { TreasuryRatiosService } from '../treasury-ratios.service';

/**
 * Treasury one-pane dashboard: placements ladder, nostro balances
 * (revalued), prudential headroom and matcher health.
 */
@Component({
  selector: 'mifosx-treasury-dashboard',
  templateUrl: './dashboard.component.html',
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
export class TreasuryDashboardComponent implements OnInit {
  private ratiosService = inject(TreasuryRatiosService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  /** Aggregated panes (null = not loaded yet). */
  dashboard: any = null;

  positionsDataSource = new MatTableDataSource<any>([]);
  positionColumns: string[] = [
    'currency',
    'net',
    'netIdr'
  ];

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.ratiosService
      .getDashboard()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of(null))
      )
      .subscribe((dashboard: any) => {
        this.dashboard = dashboard;
        this.positionsDataSource.data = dashboard && Array.isArray(dashboard.revaluation) ? dashboard.revaluation : [];
        this.cdr.markForCheck();
      });
  }
}
