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
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
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

/** Custom Components */
import { PaymentTrafficChartComponent } from '../traffic-chart/traffic-chart.component';

/**
 * Payments dashboard: filter bar (rail + date range + CSV export), KPI cards
 * with real previous-window trends, traffic chart and the rails table.
 */
@Component({
  selector: 'mifosx-payment-rails',
  templateUrl: './rails-dashboard.component.html',
  styleUrls: ['./rails-dashboard.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ReactiveFormsModule,
    PaymentTrafficChartComponent,
    MatCard,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatButton,
    FaIconComponent,
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
  private cdr = inject(ChangeDetectorRef);
  private formBuilder = inject(FormBuilder);

  filtersForm: FormGroup = this.formBuilder.group({ rail: ['ALL'], dateRange: ['DAY'] });

  rails: any[] = [];
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

  kpis: Array<{ labelKey: string; value: string; trend: number | null; positive: boolean; money: boolean }> = [];
  chartFrom = '';
  chartTo = '';
  chartGranularity = 'DAY';
  chartRail = 'ALL';

  private orders: any[] = [];

  ngOnInit(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { rails: any; throughput: any }) => {
      this.rails = Array.isArray(data.rails) ? data.rails : [];
      const throughput = data.throughput ?? {};
      const perRail = throughput.rails ?? {};
      this.railsDataSource.data = this.rails.map((rail: any) => ({
        ...rail,
        count: perRail[rail.code]?.count ?? 0,
        totalValue: perRail[rail.code]?.totalValue ?? 0
      }));
      this.queueDepth = throughput.rtgsQueueDepth ?? null;
      this.oldestQueuedHours = throughput.oldestQueuedHours ?? null;
      this.openBreaks = throughput.openBreaks ?? 0;
      this.cdr.markForCheck();
    });
    this.paymentsService
      .getOrders()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((orders: any) => {
        this.orders = Array.isArray(orders) ? orders : [];
        this.refresh();
      });
    this.filtersForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.refresh());
    this.refresh();
  }

  private windowDays(): number {
    const range = this.filtersForm.value.dateRange ?? 'DAY';
    if (range === 'YEAR') {
      return 365;
    }
    if (range === 'MONTH') {
      return 30;
    }
    return 1;
  }

  private refresh(): void {
    const days = this.windowDays();
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const rail = this.filtersForm.value.rail ?? 'ALL';
    const inRail = (order: any) => rail === 'ALL' || order.rail === rail;
    const inWindow = (order: any, startMs: number, endMs: number) => {
      const stamp = order.createdOn ? Date.parse(order.createdOn) : NaN;
      return inRail(order) && !Number.isNaN(stamp) && stamp >= startMs && stamp < endMs;
    };
    const cur = this.orders.filter((order) => inWindow(order, now - days * dayMs, now));
    const prev = this.orders.filter((order) => inWindow(order, now - 2 * days * dayMs, now - days * dayMs));
    const sum = (items: any[]) => items.reduce((total: number, order: any) => total + Number(order.amount ?? 0), 0);
    const trend = (curValue: number, prevValue: number): number | null =>
      prevValue > 0 ? Math.abs(((curValue - prevValue) / prevValue) * 100) : null;
    const settled = cur.filter((order: any) => order.status === 'SETTLED').length;
    this.kpis = [
      {
        labelKey: 'labels.text.Total Orders',
        value: `${cur.length}`,
        trend: trend(cur.length, prev.length),
        positive: cur.length >= prev.length,
        money: false
      },
      {
        labelKey: 'labels.text.Total Value',
        value: `${Math.round(sum(cur))}`,
        trend: trend(sum(cur), sum(prev)),
        positive: sum(cur) >= sum(prev),
        money: true
      },
      {
        labelKey: 'labels.text.Settled Orders',
        value: `${settled}`,
        trend: null,
        positive: true,
        money: false
      },
      {
        labelKey: 'labels.text.Open Breaks',
        value: `${this.openBreaks}`,
        trend: null,
        positive: true,
        money: false
      },
      {
        labelKey: 'labels.text.RTGS Queue',
        value: `${this.queueDepth ?? 0}`,
        trend: null,
        positive: true,
        money: false
      }
    ];
    const granularity = this.filtersForm.value.dateRange ?? 'DAY';
    const stamp = (date: Date) => date.toISOString().slice(0, 19);
    this.chartTo = stamp(new Date(now));
    this.chartFrom = stamp(new Date(now - days * dayMs));
    this.chartGranularity = granularity;
    this.chartRail = rail;
    this.cdr.markForCheck();
  }

  exportCsv(): void {
    const lines = ['metric,value'];
    for (const kpi of this.kpis) {
      lines.push(`${kpi.labelKey.split('.').pop()},${kpi.value}`);
    }
    for (const rail of this.railsDataSource.data) {
      lines.push(`${rail.code} count,${rail.count}`);
      lines.push(`${rail.code} value,${rail.totalValue}`);
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'payments-dashboard.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
