/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, OnInit, ViewChild, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
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

/** Custom Services */
import { ChannelingService } from '../channeling.service';

/**
 * All-partners file monitor: every staged file with row counts, newest first.
 * Ops morning check; per-file row drilldown lives on the partner detail page.
 */
@Component({
  selector: 'mifosx-channel-files',
  templateUrl: './files.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChannelFilesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private channelingService = inject(ChannelingService);
  private destroyRef = inject(DestroyRef);

  /** Columns to be displayed in files table. */
  displayedColumns: string[] = [
    'partner',
    'filename',
    'fileType',
    'receivedOn',
    'status',
    'receivedRows',
    'acceptedRows',
    'rejectedRows',
    'suspenseRows'
  ];
  /** Data source for files table. */
  dataSource = new MatTableDataSource<any>([]);

  /** Paginator for files table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for files table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { files: any }) => {
      this.dataSource.data = data.files || [];
    });
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Filters data in files table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
