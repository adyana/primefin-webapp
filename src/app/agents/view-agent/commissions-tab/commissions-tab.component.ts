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
import { AgentsService } from '../../agents.service';

/**
 * Agent commissions tab.
 */
@Component({
  selector: 'mifosx-agent-commissions-tab',
  templateUrl: './commissions-tab.component.html',
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

  ngOnInit() {
    this.agentsService
      .getCommissions(this.agentId)
      .pipe(
        take(1),
        catchError(() => of([]))
      )
      .subscribe((commissions: any[]) => {
        this.dataSource.data = Array.isArray(commissions) ? commissions : [];
        this.cdr.markForCheck();
      });
  }
}
