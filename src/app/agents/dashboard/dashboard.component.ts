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
import { AgentsService } from '../agents.service';

/**
 * Agents dashboard: filter bar (status + date range + CSV export), KPI
 * cards with real previous-window trends and the summary table.
 */
@Component({
  selector: 'mifosx-agents-dashboard',
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
export class AgentsDashboardComponent implements OnInit {
  private agentsService = inject(AgentsService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  private formBuilder = inject(FormBuilder);

  filtersForm: FormGroup = this.formBuilder.group({ status: ['ALL'], dateRange: ['DAY'] });

  summaryDataSource = new MatTableDataSource<any>([]);
  summaryColumns: string[] = [
    'metric',
    'value'
  ];

  kpis: Array<{ labelKey: string; value: string | number; trend: number | null; positive: boolean; money: boolean }> =
    [];

  private agents: any[] = [];
  private transactions: any[] = [];

  ngOnInit(): void {
    this.agentsService
      .getAgents()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of([])),
        map((agents: any[]) => (Array.isArray(agents) ? agents : []))
      )
      .subscribe((agents: any[]) => {
        this.agents = agents;
        if (agents.length === 0) {
          this.transactions = [];
          this.refresh();
          return;
        }
        const calls = agents.map((agent: any) =>
          this.agentsService.getTransactions(agent.id).pipe(
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
    const status = this.filtersForm.value.status ?? 'ALL';
    const scopedAgents = status === 'ALL' ? this.agents : this.agents.filter((a: any) => a.status === status);
    const scopedIds = new Set(scopedAgents.map((a: any) => a.id));
    const scopedTxns = this.transactions.filter((t: any) => scopedIds.has(t.agent?.id ?? t.agentId));
    const inWindow = (createdOn: string, startMs: number, endMs: number) => {
      const stamp = createdOn ? Date.parse(createdOn) : NaN;
      return !Number.isNaN(stamp) && stamp >= startMs && stamp < endMs;
    };
    const txnsCur = scopedTxns.filter((t: any) => inWindow(t.createdOn, now - days * dayMs, now));
    const txnsPrev = scopedTxns.filter((t: any) => inWindow(t.createdOn, now - 2 * days * dayMs, now - days * dayMs));
    const floatOf = (agents: any[]) => agents.reduce((sum: number, a: any) => sum + Number(a.floatBalance ?? 0), 0);
    const activeCount = scopedAgents.filter((a: any) => a.status === 'ACTIVE').length;
    const trend = (curValue: number, prevValue: number): number | null =>
      prevValue > 0 ? Math.abs(((curValue - prevValue) / prevValue) * 100) : null;
    this.kpis = [
      {
        labelKey: 'labels.text.Total Agents',
        value: `${scopedAgents.length}`,
        trend: null,
        positive: true,
        money: false
      },
      {
        labelKey: 'labels.text.Active Agents',
        value: `${activeCount}`,
        trend: null,
        positive: true,
        money: false
      },
      {
        labelKey: 'labels.text.Total Float',
        value: floatOf(scopedAgents),
        trend: null,
        positive: true,
        money: true
      },
      {
        labelKey: 'labels.text.Agent Transactions',
        value: `${txnsCur.length}`,
        trend: trend(txnsCur.length, txnsPrev.length),
        positive: txnsCur.length >= txnsPrev.length,
        money: false
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
      { labelKey: 'labels.text.Total Agents', detail: null, value: scopedAgents.length, money: false },
      ...byStatus(scopedAgents, 'status').map(
        ([
          s,
          count
        ]) => ({
          labelKey: 'labels.text.Active Agents',
          detail: s,
          value: count,
          money: false
        })
      ),
      { labelKey: 'labels.text.Total Float', detail: null, value: floatOf(scopedAgents), money: true },
      { labelKey: 'labels.text.Agent Transactions', detail: null, value: scopedTxns.length, money: false },
      ...byStatus(scopedTxns, 'type').map(
        ([
          t,
          count
        ]) => ({
          labelKey: 'labels.text.Agent Transactions',
          detail: t,
          value: count,
          money: false
        })
      )
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
    anchor.download = 'agents-dashboard.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
