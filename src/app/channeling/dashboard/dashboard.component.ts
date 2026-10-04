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
import { catchError, map, switchMap, take } from 'rxjs/operators';

/** Custom Services */
import { ChannelingService } from '../channeling.service';

/** Custom Components */
import { ChannelTrafficChartComponent } from '../traffic-chart/traffic-chart.component';

/**
 * Channeling dashboard: filter bar (partner + date range + CSV export), KPI
 * cards with real previous-window trends, traffic chart and the summary table.
 */
@Component({
  selector: 'mifosx-channel-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ReactiveFormsModule,
    ChannelTrafficChartComponent,
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
export class ChannelDashboardComponent implements OnInit {
  private channelingService = inject(ChannelingService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  private formBuilder = inject(FormBuilder);

  filtersForm: FormGroup = this.formBuilder.group({ partner: ['ALL'], dateRange: ['DAY'] });

  partners: any[] = [];
  summaryDataSource = new MatTableDataSource<any>([]);
  summaryColumns: string[] = [
    'metric',
    'value'
  ];
  moneyDataSource = new MatTableDataSource<any>([]);
  moneyColumns: string[] = [
    'date',
    'disbCount',
    'disbAmount',
    'payCount',
    'payAmount'
  ];

  kpis: Array<{ labelKey: string; value: string; trend: number | null; positive: boolean }> = [];
  chartFrom = '';
  chartTo = '';
  chartGranularity = 'DAY';
  chartPartner = 'ALL';

  private files: any[] = [];
  private rows: any[] = [];
  private products: any[] = [];

  ngOnInit(): void {
    this.channelingService
      .getPartners()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((partners: any[]) =>
          forkJoin({
            partners: of(Array.isArray(partners) ? partners : []),
            products: this.channelingService.getProducts().pipe(catchError(() => of([]))),
            files: this.channelingService.getFiles().pipe(catchError(() => of([])))
          })
        ),
        switchMap((base: { partners: any[]; products: any[]; files: any[] }) => {
          const rowsCalls = base.files.map((file: any) =>
            this.channelingService.getFileRows(file.id).pipe(
              map((rows: any[]) => (Array.isArray(rows) ? rows : []).map((row: any) => ({ ...row, fileId: file.id }))),
              catchError(() => of([]))
            )
          );
          return (rowsCalls.length > 0 ? forkJoin(rowsCalls) : of([])).pipe(
            map((rowsGroups: any[]) => ({ ...base, rows: rowsGroups.flat() }))
          );
        })
      )
      .subscribe((data: { partners: any[]; products: any[]; files: any[]; rows: any[] }) => {
        this.partners = data.partners;
        this.products = Array.isArray(data.products) ? data.products : [];
        this.files = Array.isArray(data.files) ? data.files : [];
        this.rows = Array.isArray(data.rows) ? data.rows : [];
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
    const partner = this.filtersForm.value.partner ?? 'ALL';
    const inPartner = (file: any) => partner === 'ALL' || file.partner === partner;
    const inWindow = (receivedOn: string, startMs: number, endMs: number) => {
      const stamp = receivedOn ? Date.parse(receivedOn) : NaN;
      return !Number.isNaN(stamp) && stamp >= startMs && stamp < endMs;
    };
    const filesCur = this.files.filter(
      (file: any) => inPartner(file) && inWindow(file.receivedOn, now - days * dayMs, now)
    );
    const filesPrev = this.files.filter(
      (file: any) => inPartner(file) && inWindow(file.receivedOn, now - 2 * days * dayMs, now - days * dayMs)
    );
    const rowsFor = (files: any[]) => {
      const ids = new Set(files.map((file: any) => file.id));
      return this.rows.filter((row: any) => ids.has(row.fileId));
    };
    const rowsCur = rowsFor(filesCur);
    const rowsPrev = rowsFor(filesPrev);
    const posted = rowsCur.filter((row: any) => row.status === 'POSTED').length;
    const postedRate = rowsCur.length > 0 ? Math.round((posted / rowsCur.length) * 100) : 0;
    const activePartners = (
      partner === 'ALL' ? this.partners : this.partners.filter((p: any) => p.code === partner)
    ).filter((p: any) => p.status === 'ACTIVE').length;
    const trend = (curValue: number, prevValue: number): number | null =>
      prevValue > 0 ? Math.abs(((curValue - prevValue) / prevValue) * 100) : null;
    this.kpis = [
      {
        labelKey: 'labels.text.Staged Files',
        value: `${filesCur.length}`,
        trend: trend(filesCur.length, filesPrev.length),
        positive: filesCur.length >= filesPrev.length
      },
      {
        labelKey: 'labels.text.File Rows',
        value: `${rowsCur.length}`,
        trend: trend(rowsCur.length, rowsPrev.length),
        positive: rowsCur.length >= rowsPrev.length
      },
      { labelKey: 'labels.text.Posted Rate', value: `${postedRate}%`, trend: null, positive: true },
      { labelKey: 'labels.text.Active Partners', value: `${activePartners}`, trend: null, positive: true }
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
    const scopedPartners = partner === 'ALL' ? this.partners : this.partners.filter((p: any) => p.code === partner);
    const scopedPartnerIds = new Set(scopedPartners.map((p: any) => p.id));
    const scopedFiles = this.files.filter(inPartner);
    const scopedRows = rowsFor(scopedFiles);
    const summary: Array<{ labelKey: string; detail: string | null; value: number }> = [
      { labelKey: 'labels.text.Total Partners', detail: null, value: scopedPartners.length },
      ...byStatus(scopedPartners, 'status').map(
        ([
          status,
          count
        ]) => ({
          labelKey: 'labels.text.Partners',
          detail: status,
          value: count
        })
      ),
      {
        labelKey: 'labels.text.Product Mappings',
        detail: null,
        value: this.products.filter((p: any) => scopedPartnerIds.has(p.partnerId)).length
      },
      { labelKey: 'labels.text.Staged Files', detail: null, value: scopedFiles.length },
      ...byStatus(scopedRows, 'status').map(
        ([
          status,
          count
        ]) => ({
          labelKey: 'labels.text.File Rows',
          detail: status,
          value: count
        })
      )
    ];
    this.summaryDataSource.data = summary;
    const granularity = this.filtersForm.value.dateRange ?? 'DAY';
    const stamp = (date: Date) => date.toISOString().slice(0, 10);
    this.chartTo = stamp(new Date(now));
    this.chartFrom = stamp(new Date(now - days * dayMs));
    this.chartGranularity = granularity;
    this.chartPartner = partner;
    this.channelingService
      .getMovement(this.chartFrom, this.chartTo, partner)
      .pipe(
        take(1),
        catchError(() => of(null))
      )
      .subscribe((movement: any) => {
        if (!movement) {
          return;
        }
        this.kpis = [
          ...this.kpis,
          {
            labelKey: 'labels.text.Loans Disbursed',
            value: `${movement.disbCount ?? 0}`,
            trend: null,
            positive: true
          },
          {
            labelKey: 'labels.text.Disbursed Amount',
            value: `${movement.disbAmount ?? 0}`,
            trend: null,
            positive: true
          },
          {
            labelKey: 'labels.text.Payments Received',
            value: `${movement.payCount ?? 0}`,
            trend: null,
            positive: true
          },
          {
            labelKey: 'labels.text.Received Amount',
            value: `${movement.payAmount ?? 0}`,
            trend: null,
            positive: true
          }
        ];
        this.moneyDataSource.data = Array.isArray(movement.daily) ? movement.daily : [];
        this.cdr.markForCheck();
      });
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
    lines.push('date,disbursed_count,disbursed_amount,payments_received,received_amount');
    for (const row of this.moneyDataSource.data) {
      lines.push(`${row.date},${row.disbCount},${row.disbAmount},${row.payCount},${row.payAmount}`);
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'channeling-dashboard.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
