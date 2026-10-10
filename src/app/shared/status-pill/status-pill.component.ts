/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * Status pill (PrimeFin page standard, Phase 1): uppercase dot-led badge
 * lifted from the loans board. Tone resolves from the status value;
 * pass `tone` explicitly for statuses outside the default map.
 *
 * Default map — active: ACTIVE, PASS, SUCCESS, POSTED, SENT, OK,
 * RECOVERED, APPROVED, KEPT; pending: PENDING, WATCH, SUBMITTED, DRAFT,
 * PARTIAL, OPEN, REMINDER, FIELD_VISIT, RESTRUCTURED, PROPOSED,
 * PROMISED, FOLLOW_UP; neutral: CLOSED, MATURED, RESOLVED, SKIPPED,
 * WRITTEN_OFF, CANCELLED, NOT_FOUND; alert: FAILED, BREACH, REJECTED,
 * OVERDUE, ESCALATED, LEGAL, REFUSED, BROKEN, otherwise neutral.
 *
 * Usage: `<mifosx-status-pill status="PLACED" />`
 */
@Component({
  selector: 'mifosx-status-pill',
  template: `<span class="status-pill" [class]="toneClass"
    ><span class="dot"></span><span class="label">{{ status }}</span></span
  >`,
  styleUrls: ['./status-pill.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusPillComponent {
  /** Raw status value (rendered verbatim, uppercased by CSS). */
  @Input() status = '';

  /** Explicit tone override: active | pending | neutral | alert. */
  @Input() tone: 'active' | 'pending' | 'neutral' | 'alert' | '' = '';

  private static readonly ACTIVE = new Set([
    'ACTIVE',
    'PASS',
    'SUCCESS',
    'POSTED',
    'SENT',
    'OK',
    'RECOVERED',
    'COMPLETED',
    'APPROVED',
    'KEPT'
  ]);

  private static readonly PENDING = new Set([
    'PENDING',
    'WATCH',
    'SUBMITTED',
    'DRAFT',
    'PARTIAL',
    'OPEN',
    'EXECUTING',
    'REMINDER',
    'FIELD_VISIT',
    'RESTRUCTURED',
    'PROPOSED',
    'PROMISED',
    'FOLLOW_UP'
  ]);

  private static readonly NEUTRAL = new Set([
    'CLOSED',
    'MATURED',
    'RESOLVED',
    'SKIPPED',
    'WRITTEN_OFF',
    'CANCELLED',
    'NOT_FOUND'
  ]);

  private static readonly ALERT = new Set([
    'FAILED',
    'BREACH',
    'REJECTED',
    'OVERDUE',
    'ESCALATED',
    'LEGAL',
    'REFUSED',
    'BROKEN'
  ]);

  get toneClass(): string {
    if (this.tone) {
      return this.tone;
    }
    const key = (this.status || '').toUpperCase();
    if (StatusPillComponent.ACTIVE.has(key)) {
      return 'active';
    }
    if (StatusPillComponent.PENDING.has(key)) {
      return 'pending';
    }
    if (StatusPillComponent.ALERT.has(key)) {
      return 'alert';
    }
    return 'neutral';
  }
}
