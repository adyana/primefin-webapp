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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
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
import { take } from 'rxjs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Custom Services */
import { PaymentsService } from '../payments.service';

/**
 * Virtual accounts board with filter, sort and a match-now action that
 * links unlinked inbound orders without moving money.
 */
@Component({
  selector: 'mifosx-vas-list',
  templateUrl: './vas-list.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    RouterLink,
    FaIconComponent,
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
    MatPaginator,
    MatButton
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VasListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private paymentsService = inject(PaymentsService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  /** VAs data. */
  vasData: any;
  /** Columns to be displayed in VAs table. */
  displayedColumns: string[] = [
    'vaNumber',
    'name',
    'expectedAmount',
    'collectedTotal',
    'status'
  ];
  /** Data source for VAs table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for VAs table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for VAs table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { vas: any }) => {
      this.vasData = data.vas || [];
    });
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.vasData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Filters data in VAs table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Runs inbound matching now, then reloads the board.
   */
  matchNow(): void {
    this.paymentsService
      .runVaMatch()
      .pipe(take(1))
      .subscribe(() => {
        this.paymentsService
          .getVas()
          .pipe(take(1))
          .subscribe((vas: any) => {
            this.dataSource.data = Array.isArray(vas) ? vas : [];
            this.cdr.markForCheck();
          });
      });
  }
}
