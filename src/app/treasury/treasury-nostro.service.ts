/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/** rxjs Imports */
import { Observable, map } from 'rxjs';

/**
 * Treasury nostro service: MT940 import, statements, lines and the
 * exception-only match sweep. Breaks display reuses the payments
 * breaks board contract, filtered to NOSTRO reasons.
 */
@Injectable({ providedIn: 'root' })
export class TreasuryNostroService {
  private http = inject(HttpClient);

  /**
   * @returns Imported statements, newest first.
   */
  getStatements(): Observable<any> {
    return this.http.get('/v2/treasury-nostro/statements');
  }

  /**
   * @returns Lines of a statement with match state.
   */
  getLines(statementId: number): Observable<any> {
    return this.http.get(`/v2/treasury-nostro/statements/${statementId}/lines`);
  }

  /**
   * @param mt940 MT940 file text.
   * @returns Import counts (statementId, matched, breaks).
   */
  importStatement(mt940: string): Observable<any> {
    return this.http.post('/v2/treasury-nostro/import', { mt940 });
  }

  /**
   * @returns Sweep counts (matched, breaks).
   */
  sweepMatch(): Observable<any> {
    return this.http.post('/v2/treasury-nostro/sweep', {});
  }

  /**
   * @returns OPEN nostro breaks (shared recon board, NOSTRO prefix).
   */
  getNostroBreaks(): Observable<any> {
    return this.http
      .get<any[]>('/v2/payment-breaks', { params: { status: 'OPEN' } })
      .pipe(
        map((breaks: any[]) =>
          (Array.isArray(breaks) ? breaks : []).filter((row: any) => (row.reason || '').startsWith('NOSTRO'))
        )
      );
  }
}
