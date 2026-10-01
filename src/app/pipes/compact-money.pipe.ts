/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Pipe, PipeTransform } from '@angular/core';

/**
 * Compact money pipe: IDR 1_234_567.89 renders as "IDR 1.2M" instead of a
 * wall of zeroes. Pure function of its input; exact figures stay in detail
 * tables and CSV exports.
 */
@Pipe({ name: 'compactMoney', pure: true })
export class CompactMoneyPipe implements PipeTransform {
  transform(value: number | string | null | undefined, currency = 'IDR'): string {
    if (value === null || value === undefined || value === '') {
      return '—';
    }
    const amount = Number(value);
    if (Number.isNaN(amount)) {
      return '—';
    }
    const sign = amount < 0 ? '-' : '';
    const abs = Math.abs(amount);
    const trim = (scaled: number): string => {
      const rounded = Math.round(scaled * 10) / 10;
      return Number.isInteger(rounded) ? `${rounded}` : `${rounded.toFixed(1)}`;
    };
    if (abs >= 1_000_000_000) {
      return `${sign}${currency} ${trim(abs / 1_000_000_000)}B`;
    }
    if (abs >= 1_000_000) {
      return `${sign}${currency} ${trim(abs / 1_000_000)}M`;
    }
    if (abs >= 1_000) {
      return `${sign}${currency} ${trim(abs / 1_000)}K`;
    }
    return `${sign}${currency} ${abs.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
}
