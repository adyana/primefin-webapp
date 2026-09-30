/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
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
import { PaymentsService } from '../payments.service';

/**
 * Payment rails dashboard: seeded rail config (tickets/windows) plus today's
 * throughput per rail. Ops morning check; queue age pages treasury when stuck.
 */
@Component({
  selector: 'mifosx-payment-rails',
  templateUrl: './rails-dashboard.component.html',
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
export class RailsDashboardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private paymentsService = inject(PaymentsService);
  private destroyRef = inject(DestroyRef);

  railsDataSource = new MatTableDataSource<any>([]);
  railColumns: string[] = [
    'code',
    'status',
    'ticket',
    'window',
    'count',
    'totalValue'
  ];
  queueDepth: number | null = null;
  oldestQueuedHours: number | null = null;
  openBreaks = 0;

  ngOnInit(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { rails: any; throughput: any }) => {
      const rails = Array.isArray(data.rails) ? data.rails : [];
      const throughput = data.throughput ?? {};
      const perRail = throughput.rails ?? {};
      this.railsDataSource.data = rails.map((rail: any) => ({
        ...rail,
        count: perRail[rail.code]?.count ?? 0,
        totalValue: perRail[rail.code]?.totalValue ?? 0
      }));
      this.queueDepth = throughput.rtgsQueueDepth ?? null;
      this.oldestQueuedHours = throughput.oldestQueuedHours ?? null;
      this.openBreaks = throughput.openBreaks ?? 0;
    });
  }
}
