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

/** rxjs Imports */
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/** Custom Services */
import { QrisService } from '../qris.service';

/**
 * QRIS dashboard: filter bar (segment + date range + CSV export), KPI
 * cards with real previous-window trends and the summary table.
 */
@Component({
  selector: 'mifosx-qris-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ReactiveFormsModule,
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
export class QrisDashboardComponent implements OnInit {
  private qrisService = inject(QrisService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  private formBuilder = inject(FormBuilder);

  filtersForm: FormGroup = this.formBuilder.group({ segment: ['ALL'], dateRange: ['DAY'] });

  summaryDataSource = new MatTableDataSource<any>([]);
  summaryColumns: string[] = [
    'metric',
    'value'
  ];

  kpis: Array<{ labelKey: string; value: string | number; trend: number | null; positive: boolean; money: boolean }> =
    [];

  private merchants: any[] = [];
  private transactions: any[] = [];

  ngOnInit(): void {
    this.qrisService
      .getMerchants()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of([])),
        map((merchants: any[]) => (Array.isArray(merchants) ? merchants : []))
      )
      .subscribe((merchants: any[]) => {
        this.merchants = merchants;
        if (merchants.length === 0) {
          this.transactions = [];
          this.refresh();
          return;
        }
        const calls = merchants.map((merchant: any) =>
          this.qrisService.getTransactions(merchant.id).pipe(
            map((txns: any[]) => (Array.isArray(txns) ? txns : [])),
            catchError(() => of([]))
          )
        );
        forkJoin(calls)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((groups: any[]) => {
            this.transactions = groups.flat();
            this.refresh();
          });
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
    const segment = this.filtersForm.value.segment ?? 'ALL';
    const scopedMerchants =
      segment === 'ALL' ? this.merchants : this.merchants.filter((m: any) => m.segment === segment);
    const scopedIds = new Set(scopedMerchants.map((m: any) => m.id));
    const sales = this.transactions.filter(
      (t: any) => t.type === 'SALE' && scopedIds.has(t.merchant?.id ?? t.merchantId)
    );
    const inWindow = (createdOn: string, startMs: number, endMs: number) => {
      const stamp = createdOn ? Date.parse(createdOn) : NaN;
      return !Number.isNaN(stamp) && stamp >= startMs && stamp < endMs;
    };
    const salesCur = sales.filter((t: any) => inWindow(t.createdOn, now - days * dayMs, now));
    const salesPrev = sales.filter((t: any) => inWindow(t.createdOn, now - 2 * days * dayMs, now - days * dayMs));
    const sum = (items: any[], key: string) => items.reduce((total: number, t: any) => total + Number(t[key] ?? 0), 0);
    const activeCount = scopedMerchants.filter((m: any) => m.status === 'ACTIVE').length;
    const trend = (curValue: number, prevValue: number): number | null =>
      prevValue > 0 ? Math.abs(((curValue - prevValue) / prevValue) * 100) : null;
    this.kpis = [
      {
        labelKey: 'labels.text.Total Merchants',
        value: `${scopedMerchants.length}`,
        trend: null,
        positive: true,
        money: false
      },
      {
        labelKey: 'labels.text.Active Merchants',
        value: `${activeCount}`,
        trend: null,
        positive: true,
        money: false
      },
      {
        labelKey: 'labels.text.Gross Volume',
        value: sum(salesCur, 'amount'),
        trend: trend(sum(salesCur, 'amount'), sum(salesPrev, 'amount')),
        positive: sum(salesCur, 'amount') >= sum(salesPrev, 'amount'),
        money: true
      },
      {
        labelKey: 'labels.text.MDR Collected',
        value: sum(salesCur, 'mdrAmount'),
        trend: trend(sum(salesCur, 'mdrAmount'), sum(salesPrev, 'mdrAmount')),
        positive: sum(salesCur, 'mdrAmount') >= sum(salesPrev, 'mdrAmount'),
        money: true
      }
    ];
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
    const summary: Array<{ labelKey: string; detail: string | null; value: number; money: boolean }> = [
      { labelKey: 'labels.text.Total Merchants', detail: null, value: scopedMerchants.length, money: false },
      ...byStatus(scopedMerchants, 'status').map(
        ([
          s,
          count
        ]) => ({
          labelKey: 'labels.text.Active Merchants',
          detail: s,
          value: count,
          money: false
        })
      ),
      ...byStatus(scopedMerchants, 'segment').map(
        ([
          s,
          count
        ]) => ({
          labelKey: 'labels.text.Total Merchants',
          detail: s,
          value: count,
          money: false
        })
      ),
      { labelKey: 'labels.text.Gross Volume', detail: null, value: sum(sales, 'amount'), money: true },
      { labelKey: 'labels.text.MDR Collected', detail: null, value: sum(sales, 'mdrAmount'), money: true }
    ];
    this.summaryDataSource.data = summary;
    this.cdr.markForCheck();
  }

  exportCsv(): void {
    const lines = ['metric,value'];
    for (const kpi of this.kpis) {
      lines.push(`${kpi.labelKey.split('.').pop()},${kpi.value}`);
    }
    for (const row of this.summaryDataSource.data) {
      lines.push(`${row.labelKey.split('.').pop()} ${row.detail ?? ''},${row.value}`.trim().replace(/,$/, ','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'qris-dashboard.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
