/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewChild, inject } from '@angular/core';
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

/** Shared Page Standard */
import { PageToolbarComponent } from '../../../shared/page-toolbar/page-toolbar.component';
import { StatusPillComponent } from '../../../shared/status-pill/status-pill.component';

/** rxjs Imports */
import { catchError, of, take } from 'rxjs';

/** Custom Services */
import { QrisService } from '../../qris.service';

/**
 * Merchant static codes tab.
 */
@Component({
  selector: 'mifosx-qris-codes-tab',
  templateUrl: './codes-tab.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    PageToolbarComponent,
    StatusPillComponent,
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
    MatPaginator
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QrisCodesTabComponent implements OnInit {
  private qrisService = inject(QrisService);
  private cdr = inject(ChangeDetectorRef);

  /** Merchant id from the detail shell. */
  @Input() merchantId: number;

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [
    'payload',
    'printVersion',
    'status'
  ];

  /** Live codes count for the toolbar badge. */
  codesCount: number | null = null;

  /** Paginator for codes table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  ngOnInit() {
    this.qrisService
      .getCodes(this.merchantId)
      .pipe(
        take(1),
        catchError(() => of([]))
      )
      .subscribe((codes: any[]) => {
        this.dataSource.data = Array.isArray(codes) ? codes : [];
        this.codesCount = this.dataSource.data.length;
        this.dataSource.paginator = this.paginator;
        this.cdr.markForCheck();
      });
  }

  /**
   * Filters data in codes table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  filterCodes(filterValue: string) {
    this.dataSource.filter = (filterValue || '').trim().toLowerCase();
  }
}
