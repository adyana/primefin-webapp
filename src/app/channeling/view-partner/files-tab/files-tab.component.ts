/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, Input, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
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
import { ChannelingService } from '../../channeling.service';

/**
 * File monitor tab: staged files with counts, expandable to row outcomes.
 */
@Component({
  selector: 'mifosx-files-tab',
  templateUrl: './files-tab.component.html',
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
export class FilesTabComponent implements OnInit {
  private channelingService = inject(ChannelingService);
  private destroyRef = inject(DestroyRef);

  /** Owning partner code. */
  @Input() partnerCode: string;

  /** File table columns. */
  displayedColumns: string[] = [
    'filename',
    'fileType',
    'receivedOn',
    'status',
    'receivedRows',
    'acceptedRows',
    'rejectedRows',
    'suspenseRows'
  ];
  /** File table data. */
  dataSource = new MatTableDataSource<any>([]);
  /** Row table columns. */
  rowColumns: string[] = [
    'lineNo',
    'partnerRef',
    'status',
    'reason',
    'ourRef'
  ];
  /** Selected file's rows. */
  selectedRows: any[] | null = null;
  /** Selected file name for the rows header. */
  selectedFilename: string | null = null;

  ngOnInit() {
    this.refresh();
  }

  /**
   * Reloads this partner's staged files.
   */
  refresh() {
    this.channelingService
      .getFiles(this.partnerCode)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((rows: any) => {
        this.dataSource.data = rows || [];
      });
  }

  /**
   * Loads one file's row outcomes.
   * @param file Staged file row.
   */
  showRows(file: any) {
    this.selectedFilename = file.filename;
    this.channelingService
      .getFileRows(file.id)
      .pipe(take(1))
      .subscribe((rows: any) => {
        this.selectedRows = rows || [];
      });
  }
}
