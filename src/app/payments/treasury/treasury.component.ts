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
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
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
import { catchError } from 'rxjs/operators';

/** Custom Services */
import { PaymentsService } from '../payments.service';

/**
 * Treasury funding status: per-rail required-vs-limit with headroom, window
 * state, today's volume and in-flight batch counts. Read-only — the top-up
 * signal, not the top-up itself.
 */
@Component({
  selector: 'mifosx-treasury',
  templateUrl: './treasury.component.html',
  styleUrls: ['./treasury.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ReactiveFormsModule,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
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
export class TreasuryComponent implements OnInit {
  private paymentsService = inject(PaymentsService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  rowsDataSource = new MatTableDataSource<any>([]);
  rowColumns: string[] = [
    'rail',
    'status',
    'window',
    'required',
    'limit',
    'headroom',
    'todayVolume',
    'inFlight',
    'actions'
  ];

  /** Rail selected for config editing (null = no edit form). */
  selectedRail: any = null;
  configForm: FormGroup = this.formBuilder.group({
    ticketMin: [null],
    ticketMax: [null],
    cutoffStart: [''],
    cutoffEnd: [''],
    timezone: [''],
    prefundLimit: [null]
  });

  kpis: Array<{ labelKey: string; value: string; positive: boolean }> = [];

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    forkJoin({
      projections: this.paymentsService.getPrefund().pipe(catchError(() => of([]))),
      rails: this.paymentsService.getRails().pipe(catchError(() => of([]))),
      throughput: this.paymentsService.getThroughput().pipe(catchError(() => of({}))),
      batches: this.paymentsService.getBatches('SUBMITTED').pipe(catchError(() => of([])))
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: { projections: any; rails: any; throughput: any; batches: any }) => {
        this.refresh(
          Array.isArray(data.projections) ? data.projections : [],
          Array.isArray(data.rails) ? data.rails : [],
          data.throughput ?? {},
          Array.isArray(data.batches) ? data.batches : []
        );
      });
  }

  private refresh(projections: any[], rails: any[], throughput: any, batches: any[]): void {
    const railOf = new Map(
      rails.map((r: any) => [
        r.code,
        r
      ])
    );
    const perRail = throughput.rails ?? {};
    const inFlightByRail: Record<string, number> = {};
    for (const batch of batches) {
      const code = batch.rail ?? 'UNKNOWN';
      inFlightByRail[code] = (inFlightByRail[code] ?? 0) + 1;
    }
    const money = (v: number | null) =>
      v === null || v === undefined
        ? '—'
        : `IDR ${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const rows = projections.map((p: any) => {
      const rail = railOf.get(p.rail) ?? {};
      const required = Number(p.required ?? 0);
      const limit = p.limit === null || p.limit === undefined ? null : Number(p.limit);
      const short = (rail.cutoffStart ?? '').slice(0, 5);
      const end = (rail.cutoffEnd ?? '').slice(0, 5);
      return {
        rail: p.rail,
        raw: rail,
        status: rail.status ?? 'UNKNOWN',
        window: short && end ? `${short}–${end}` : '—',
        required: money(required),
        limit: money(limit),
        headroom: limit === null ? '—' : money(limit - required),
        breached: !!p.breached,
        todayVolume: money(Number(perRail[p.rail]?.totalValue ?? 0)),
        inFlight: `${inFlightByRail[p.rail] ?? 0}`
      };
    });
    this.rowsDataSource.data = rows;
    const breached = rows.filter((r: any) => r.breached).length;
    const totalRequired = projections.reduce((s: number, p: any) => s + Number(p.required ?? 0), 0);
    this.kpis = [
      { labelKey: 'labels.text.Breached Rails', value: `${breached}`, positive: breached === 0 },
      { labelKey: 'labels.text.Total Required', value: money(totalRequired), positive: true },
      {
        labelKey: 'labels.text.RTGS Queue',
        value: `${throughput.rtgsQueueDepth ?? 0}`,
        positive: (throughput.rtgsQueueDepth ?? 0) === 0
      },
      {
        labelKey: 'labels.text.Open Breaks',
        value: `${throughput.openBreaks ?? 0}`,
        positive: (throughput.openBreaks ?? 0) === 0
      }
    ];
    this.cdr.markForCheck();
  }

  selectForEdit(row: any): void {
    this.selectedRail = row.raw ?? null;
    const rail = this.selectedRail ?? {};
    this.configForm.reset({
      ticketMin: rail.ticketMin ?? null,
      ticketMax: rail.ticketMax ?? null,
      cutoffStart: rail.cutoffStart ?? '',
      cutoffEnd: rail.cutoffEnd ?? '',
      timezone: rail.timezone ?? '',
      prefundLimit: rail.prefundLimit ?? null
    });
    this.cdr.markForCheck();
  }

  save(): void {
    this.paymentsService
      .updateRailConfig(this.selectedRail.code, this.configForm.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.selectedRail = null;
        this.load();
      });
  }

  exportCsv(): void {
    const lines = ['rail,status,window,required,limit,headroom,todayVolume,inFlight'];
    for (const row of this.rowsDataSource.data) {
      lines.push(
        [
          row.rail,
          row.status,
          row.window,
          row.required,
          row.limit,
          row.headroom,
          row.todayVolume,
          row.inFlight
        ].join(',')
      );
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'treasury-funding.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
