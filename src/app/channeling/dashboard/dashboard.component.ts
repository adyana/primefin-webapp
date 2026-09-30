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
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

/** Custom Services */
import { ChannelingService } from '../channeling.service';

/**
 * Channeling dashboard: partner, product and file flow summary.
 * Counts partners by status, config rows, staged files and row outcomes.
 */
@Component({
  selector: 'mifosx-channel-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChannelDashboardComponent implements OnInit {
  private channelingService = inject(ChannelingService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  summaryDataSource = new MatTableDataSource<any>([]);
  summaryColumns: string[] = [
    'metric',
    'value'
  ];

  ngOnInit(): void {
    this.channelingService
      .getPartners()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((partners: any[]) =>
          forkJoin({
            partners: of(Array.isArray(partners) ? partners : []),
            products: this.channelingService.getProducts().pipe(catchError(() => of([]))),
            files: this.channelingService.getFiles().pipe(catchError(() => of([])))
          })
        ),
        switchMap((base: { partners: any[]; products: any[]; files: any[] }) => {
          const rowsCalls = base.files.map((file: any) =>
            this.channelingService.getFileRows(file.id).pipe(catchError(() => of([])))
          );
          return (rowsCalls.length > 0 ? forkJoin(rowsCalls) : of([])).pipe(
            map((rowsGroups: any[]) => ({ ...base, rows: rowsGroups.flat() }))
          );
        })
      )
      .subscribe((data: { partners: any[]; products: any[]; files: any[]; rows: any[] }) => {
        const byStatus = (items: any[], key: string): Array<[
            string,
            number
          ]> => {
          const acc: Record<string, number> = {};
          for (const item of items) {
            const k = item[key] ?? 'UNKNOWN';
            acc[k] = (acc[k] ?? 0) + 1;
          }
          return Object.entries(acc);
        };
        const rows: Array<{ labelKey: string; detail: string | null; value: number }> = [
          { labelKey: 'labels.text.Total Partners', detail: null, value: data.partners.length },
          ...byStatus(data.partners, 'status').map(
            ([
              status,
              count
            ]) => ({
              labelKey: 'labels.text.Partners',
              detail: status,
              value: count
            })
          ),
          { labelKey: 'labels.text.Product Mappings', detail: null, value: data.products.length },
          { labelKey: 'labels.text.Staged Files', detail: null, value: data.files.length },
          ...byStatus(data.rows, 'status').map(
            ([
              status,
              count
            ]) => ({
              labelKey: 'labels.text.File Rows',
              detail: status,
              value: count
            })
          )
        ];
        this.summaryDataSource.data = rows;
        this.cdr.markForCheck();
      });
  }
}
