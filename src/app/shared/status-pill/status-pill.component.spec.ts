/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { StatusPillComponent } from './status-pill.component';

describe('StatusPillComponent', () => {
  function toneFor(status: string): string {
    const pill = new StatusPillComponent();
    pill.status = status;
    return pill.toneClass;
  }

  it('should map healthy statuses to active', () => {
    for (const status of [
      'ACTIVE',
      'PASS',
      'SUCCESS',
      'POSTED',
      'SENT',
      'OK',
      'COMPLETED',
      'RECOVERED',
      'APPROVED',
      'KEPT',
      'active'
    ]) {
      expect(toneFor(status)).toBe('active');
    }
  });

  it('should map attention statuses to pending', () => {
    for (const status of [
      'PENDING',
      'WATCH',
      'SUBMITTED',
      'DRAFT',
      'PARTIAL',
      'EXECUTING',
      'OPEN',
      'REMINDER',
      'FIELD_VISIT',
      'RESTRUCTURED',
      'PROPOSED',
      'PROMISED',
      'FOLLOW_UP'
    ]) {
      expect(toneFor(status)).toBe('pending');
    }
  });

  it('should map terminal-neutral statuses to neutral', () => {
    for (const status of [
      'CLOSED',
      'MATURED',
      'RESOLVED',
      'SKIPPED',
      'WRITTEN_OFF',
      'CANCELLED',
      'NOT_FOUND'
    ]) {
      expect(toneFor(status)).toBe('neutral');
    }
  });

  it('should map failure statuses to alert', () => {
    for (const status of [
      'FAILED',
      'BREACH',
      'REJECTED',
      'OVERDUE',
      'ESCALATED',
      'LEGAL',
      'REFUSED',
      'BROKEN'
    ]) {
      expect(toneFor(status)).toBe('alert');
    }
  });

  it('should default unknown statuses to neutral', () => {
    expect(toneFor('PLACED')).toBe('neutral');
    expect(toneFor('')).toBe('neutral');
  });

  it('should honor an explicit tone override', () => {
    const pill = new StatusPillComponent();
    pill.status = 'PLACED';
    pill.tone = 'pending';
    expect(pill.toneClass).toBe('pending');
  });
});
