/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { SettingsService } from 'app/settings/settings.service';
import { CustomDateAdapter } from './custom-date-adapter';

describe('CustomDateAdapter', () => {
  let adapter: CustomDateAdapter;
  let settings: { dateFormat: string; language: { code: string } };

  function setup(format: string): void {
    settings = { dateFormat: format, language: { code: 'en' } };
    TestBed.configureTestingModule({
      providers: [
        CustomDateAdapter,
        { provide: SettingsService, useValue: settings }
      ]
    });
    adapter = TestBed.inject(CustomDateAdapter);
  }

  it('should render Angular token formats', () => {
    setup('dd MMMM yyyy');
    expect(adapter.format(new Date(2026, 9, 9), null)).toBe('09 October 2026');
  });

  it('should normalize moment-style formats instead of printing literal DD', () => {
    setup('YYYY-MM-DD');
    expect(adapter.format(new Date(2026, 9, 9), null)).toBe('2026-10-09');
  });

  it('should parse ISO input under a moment-style format', () => {
    setup('YYYY-MM-DD');
    const parsed = adapter.parse('2026-10-09');
    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(9);
    expect(parsed?.getDate()).toBe(9);
  });
});
