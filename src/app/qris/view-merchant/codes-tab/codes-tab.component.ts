/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, inject } from '@angular/core';
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
import { QrisService } from '../../qris.service';

/**
 * Merchant static codes tab.
 */
@Component({
  selector: 'mifosx-qris-codes-tab',
  templateUrl: './codes-tab.component.html',
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

  ngOnInit() {
    this.qrisService
      .getCodes(this.merchantId)
      .pipe(
        take(1),
        catchError(() => of([]))
      )
      .subscribe((codes: any[]) => {
        this.dataSource.data = Array.isArray(codes) ? codes : [];
        this.cdr.markForCheck();
      });
  }
}
