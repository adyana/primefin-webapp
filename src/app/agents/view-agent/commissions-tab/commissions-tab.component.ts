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
import { AgentsService } from '../../agents.service';

/**
 * Agent commissions tab.
 */
@Component({
  selector: 'mifosx-agent-commissions-tab',
  templateUrl: './commissions-tab.component.html',
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
export class CommissionsTabComponent implements OnInit {
  private agentsService = inject(AgentsService);
  private cdr = inject(ChangeDetectorRef);

  /** Agent id from the detail shell. */
  @Input() agentId: number;

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [
    'transaction',
    'amount',
    'status'
  ];

  /** Live commissions count for the toolbar badge. */
  commissionsCount: number | null = null;

  /** Paginator for commissions table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.agentsService
      .getCommissions(this.agentId)
      .pipe(
        take(1),
        catchError(() => of([]))
      )
      .subscribe((commissions: any[]) => {
        this.dataSource.data = Array.isArray(commissions) ? commissions : [];
        this.commissionsCount = this.dataSource.data.length;
        this.cdr.markForCheck();
      });
  }

  /**
   * Filters data in commissions table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  filterCommissions(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
