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
import { Observable } from 'rxjs';

/**
 * Compliance service: deny-list registry, entries, bulk import, hits and
 * the false-positive allow-list. Served by the fineract-compliance module
 * under /api/v2/compliance-* (program slice #1).
 */
@Injectable({
  providedIn: 'root'
})
export class ComplianceService {
  private http = inject(HttpClient);

  /**
   * @returns All deny lists.
   */
  getLists(): Observable<any> {
    return this.http.get('/v2/compliance-lists');
  }

  /**
   * @param list List payload (code, source, description).
   * @returns Creation result with resourceId.
   */
  createList(list: any): Observable<any> {
    return this.http.post('/v2/compliance-lists', list);
  }

  /**
   * @param listId List id.
   * @returns The list's entries.
   */
  getEntries(listId: number): Observable<any> {
    return this.http.get(`/v2/compliance-lists/${listId}/entries`);
  }

  /**
   * @param listId List id.
   * @param entry Entry payload (subjectType, value, reason).
   * @returns Creation result with resourceId.
   */
  createEntry(listId: number, entry: any): Observable<any> {
    return this.http.post(`/v2/compliance-lists/${listId}/entries`, entry);
  }

  /**
   * @param entryId Entry id.
   * @returns Deletion result.
   */
  deleteEntry(entryId: number): Observable<any> {
    return this.http.delete(`/v2/compliance-lists/entries/${entryId}`);
  }

  /**
   * @param listId List id.
   * @param payload Import payload (format CSV, content text).
   * @returns Import result (created count as resourceId).
   */
  importRows(listId: number, payload: any): Observable<any> {
    return this.http.post(`/v2/compliance-lists/${listId}/import`, payload);
  }

  /**
   * @returns Screening-hit audit, newest first.
   */
  getHits(): Observable<any> {
    return this.http.get('/v2/compliance-hits');
  }

  /**
   * @returns False-positive releases.
   */
  getAllowList(): Observable<any> {
    return this.http.get('/v2/compliance-allow');
  }

  /**
   * @param allow Allow payload (subjectType, value, reason).
   * @returns Creation result with resourceId.
   */
  createAllow(allow: any): Observable<any> {
    return this.http.post('/v2/compliance-allow', allow);
  }

  /**
   * @param allowId Allow id.
   * @returns Revocation result.
   */
  deleteAllow(allowId: number): Observable<any> {
    return this.http.delete(`/v2/compliance-allow/${allowId}`);
  }

  /**
   * Checker step: approve a pending release. The backend rejects
   * self-approval (maker must differ from approver).
   * @param allowId Allow id.
   * @returns Approval result with resourceId.
   */
  approveAllow(allowId: number): Observable<any> {
    return this.http.post(`/v2/compliance-allow/${allowId}/approve`, {});
  }
}
