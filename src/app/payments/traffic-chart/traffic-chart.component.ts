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
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  inject,
  DestroyRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCard, MatCardHeader, MatCardContent } from '@angular/material/card';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Charting Imports */
import { Chart, registerables } from 'chart.js';

/** Custom Services */
import { PaymentsService } from '../payments.service';

Chart.register(...registerables);

/**
 * Payment traffic chart: order counts per rail for a caller-supplied window.
 * The dashboard filter bar owns granularity; this card only renders.
 */
@Component({
  selector: 'mifosx-payment-traffic-chart',
  templateUrl: './traffic-chart.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCard,
    MatCardHeader,
    MatCardContent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentTrafficChartComponent implements OnInit, OnChanges {
  private paymentsService = inject(PaymentsService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  @Input() from = '';
  @Input() to = '';
  @Input() granularity = 'DAY';
  @Input() rail = 'ALL';

  chart: any;
  hideOutput = true;

  private palette = [
    'dodgerblue',
    'red',
    'green',
    'orange',
    'purple',
    'teal',
    'brown'
  ];

  ngOnInit(): void {
    this.load();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['from']?.firstChange || !changes['to']?.firstChange || !changes['granularity']?.firstChange) {
      this.load();
    }
  }

  private load(): void {
    if (!this.from || !this.to) {
      return;
    }
    this.paymentsService
      .getTraffic(this.from, this.to, this.granularity)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((series: any[]) => this.setChart(series));
  }

  private setChart(series: any[]): void {
    const scoped = this.rail === 'ALL' ? series : series.filter((point: any) => point.rail === this.rail);
    const buckets = [...new Set(scoped.map((point: any) => point.bucket))].sort();
    const rails = [...new Set(scoped.map((point: any) => point.rail))].sort();
    const datasets = rails.map((rail: string, index: number) => ({
      label: rail,
      data: buckets.map(
        (bucket: string) => scoped.find((point: any) => point.bucket === bucket && point.rail === rail)?.count ?? 0
      ),
      backgroundColor: this.palette[index % this.palette.length],
      borderColor: this.palette[index % this.palette.length],
      borderWidth: 2,
      fill: false
    }));
    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = new Chart('payment-traffic-chart', {
      type: 'line',
      data: { labels: buckets, datasets },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } },
        scales: { y: { min: 0, title: { display: true, text: 'Orders' } } }
      }
    });
    this.hideOutput = false;
    this.cdr.markForCheck();
  }
}
