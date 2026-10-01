/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CompactMoneyPipe } from './compact-money.pipe';

describe('CompactMoneyPipe', () => {
  const pipe = new CompactMoneyPipe();

  it('should compact thousands, millions and billions', () => {
    expect(pipe.transform(850000)).toBe('IDR 850K');
    expect(pipe.transform(1234567)).toBe('IDR 1.2M');
    expect(pipe.transform(2000000000)).toBe('IDR 2B');
  });

  it('should keep small amounts exact and handle signs and gaps', () => {
    expect(pipe.transform(500)).toBe('IDR 500.00');
    expect(pipe.transform(-1800)).toBe('-IDR 1.8K');
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform(undefined)).toBe('—');
    expect(pipe.transform('not-a-number')).toBe('—');
  });
});
