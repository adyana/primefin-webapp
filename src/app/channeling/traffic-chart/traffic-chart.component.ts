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
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCard, MatCardHeader, MatCardContent } from '@angular/material/card';
import { MatButtonToggleGroup, MatButtonToggle } from '@angular/material/button-toggle';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Charting Imports */
import { Chart, registerables } from 'chart.js';

/** Custom Services */
import { ChannelingService } from '../channeling.service';

Chart.register(...registerables);

/**
 * Channel traffic chart: staged file rows per partner over DAY, MONTH or
 * YEAR buckets. Same card + toggle pattern as the home dashboard charts.
 */
@Component({
  selector: 'mifosx-channel-traffic-chart',
  templateUrl: './traffic-chart.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ReactiveFormsModule,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatButtonToggleGroup,
    MatButtonToggle
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChannelTrafficChartComponent implements OnInit {
  private channelingService = inject(ChannelingService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  timescale = new FormControl('DAY');
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
    this.timescale.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.load());
    this.load();
  }

  private range(): { from: string; to: string } {
    const to = new Date();
    const from = new Date(to);
    const scale = this.timescale.value ?? 'DAY';
    if (scale === 'YEAR') {
      from.setFullYear(to.getFullYear() - 5);
    } else if (scale === 'MONTH') {
      from.setMonth(to.getMonth() - 12);
    } else {
      from.setDate(to.getDate() - 30);
    }
    const day = (date: Date) => date.toISOString().slice(0, 10);
    return { from: day(from), to: day(to) };
  }

  private load(): void {
    const scale = this.timescale.value ?? 'DAY';
    const { from, to } = this.range();
    this.channelingService
      .getTraffic(from, to, scale)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((series: any[]) => this.setChart(series));
  }

  private setChart(series: any[]): void {
    const buckets = [...new Set(series.map((point: any) => point.bucket))].sort();
    const partners = [...new Set(series.map((point: any) => point.partner))].sort();
    const datasets = partners.map((partner: string, index: number) => ({
      label: partner,
      data: buckets.map((bucket: string) =>
        series
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
