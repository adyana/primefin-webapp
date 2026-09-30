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
import { MatCard, MatCardContent } from '@angular/material/card';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Charting Imports */
import { Chart, registerables } from 'chart.js';

/** Custom Services */
import { ChannelingService } from '../channeling.service';

Chart.register(...registerables);

/**
 * Channel traffic chart: staged file rows per partner for a caller-supplied
 * window. The dashboard filter bar owns granularity; this card only renders.
 */
@Component({
  selector: 'mifosx-channel-traffic-chart',
  templateUrl: './traffic-chart.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCard,
    MatCardContent,
    FaIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChannelTrafficChartComponent implements OnInit, OnChanges {
  private channelingService = inject(ChannelingService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  @Input() from = '';
  @Input() to = '';
  @Input() granularity = 'DAY';
  @Input() partner = 'ALL';

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
    this.channelingService
      .getTraffic(this.from.slice(0, 10), this.to.slice(0, 10), this.granularity)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((series: any[]) => this.setChart(series));
  }

  private setChart(series: any[]): void {
    const scoped = this.partner === 'ALL' ? series : series.filter((point: any) => point.partner === this.partner);
    const buckets = [...new Set(scoped.map((point: any) => point.bucket))].sort();
    const partners = [...new Set(scoped.map((point: any) => point.partner))].sort();
    const datasets = partners.map((partner: string, index: number) => ({
      label: partner,
      data: buckets.map((bucket: string) =>
        scoped
          .filter((point: any) => point.bucket === bucket && point.partner === partner)
          .reduce((sum: number, point: any) => sum + (point.rows ?? 0), 0)
      ),
      backgroundColor: this.palette[index % this.palette.length],
      borderColor: this.palette[index % this.palette.length],
      borderWidth: 2,
      fill: false
    }));
    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = new Chart('channel-traffic-chart', {
      type: 'line',
      data: { labels: buckets, datasets },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } },
        scales: { y: { min: 0, title: { display: true, text: 'File rows' } } }
      }
    });
    this.hideOutput = false;
    this.cdr.markForCheck();
  }
}
