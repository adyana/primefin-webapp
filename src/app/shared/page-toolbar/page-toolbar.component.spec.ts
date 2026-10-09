/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { firstValueFrom, toArray } from 'rxjs';
import { PageToolbarComponent } from './page-toolbar.component';

describe('PageToolbarComponent', () => {
  it('should default to no count and no export', () => {
    const toolbar = new PageToolbarComponent();
    expect(toolbar.count).toBeNull();
    expect(toolbar.showExport).toBe(false);
  });

  it('should emit search text', async () => {
    const toolbar = new PageToolbarComponent();
    const seen = firstValueFrom(toolbar.searchChange);
    toolbar.searchChange.emit('BCA');
    expect(await seen).toBe('BCA');
  });

  it('should emit export on demand', async () => {
    const toolbar = new PageToolbarComponent();
    toolbar.showExport = true;
    const seen = firstValueFrom(toolbar.export);
    toolbar.export.emit();
    await seen;
    expect(toolbar.showExport).toBe(true);
  });

  it('should collect a search stream', async () => {
    const toolbar = new PageToolbarComponent();
    const collected = toolbar.searchChange.pipe(toArray()).toPromise();
    toolbar.searchChange.emit('a');
    toolbar.searchChange.emit('ab');
    toolbar.searchChange.complete();
    expect(await collected).toEqual([
      'a',
      'ab'
    ]);
  });
});
