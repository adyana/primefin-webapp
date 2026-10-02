/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

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

  /**
   * @returns Monitoring rules with tunable thresholds.
   */
  getAmlRules(): Observable<any> {
    return this.http.get('/v2/aml-rules');
  }

  /**
   * @param ruleId Rule id.
   * @param rule Rule payload (thresholdAmount, windowDays, countThreshold, enabled).
   * @returns Updated rule.
   */
  updateAmlRule(ruleId: number, rule: any): Observable<any> {
    return this.http.put(`/v2/aml-rules/${ruleId}`, rule);
  }

  /**
   * @param status Case status filter (optional; all cases when omitted).
   * @returns Suspicious cases, newest last.
   */
  getAmlCases(status?: string): Observable<any> {
    let params = new HttpParams();
    if (status !== undefined) {
      params = params.set('status', status);
    }
    return this.http.get('/v2/aml-cases', { params });
  }

  /**
   * @param caseId Case id.
   * @param reason Filing reason.
   * @returns Proposal result.
   */
  proposeCase(caseId: number, reason: string): Observable<any> {
    return this.http.post(`/v2/aml-cases/${caseId}/propose`, { reason });
  }

  /**
   * @param caseId Case id.
   * @returns Approval result (checker step, emits the STR).
   */
  approveCase(caseId: number): Observable<any> {
    return this.http.post(`/v2/aml-cases/${caseId}/approve`, {});
  }

  /**
   * @param caseId Case id.
   * @param reason Close reason.
   * @returns Close result.
   */
  closeCase(caseId: number, reason: string): Observable<any> {
    return this.http.post(`/v2/aml-cases/${caseId}/close`, { reason });
  }

  /**
   * @returns Reports, newest first.
   */
  getAmlReports(): Observable<any> {
    return this.http.get('/v2/aml-reports');
  }

  /**
   * @param report Report payload (reportType LTKT/LTKL, from, to).
   * @returns Generation result with resourceId.
   */
  generateReport(report: any): Observable<any> {
    return this.http.post('/v2/aml-reports/generate', report);
  }

  /**
   * @returns SLIK snapshots, newest first.
   */
  getSlikSnapshots(): Observable<any> {
    return this.http.get('/v2/slik-snapshots');
  }

  /**
   * @param period Period YYYYMM.
   * @returns Close result with resourceId.
   */
  closeSlikPeriod(period: string): Observable<any> {
    return this.http.post(`/v2/slik-snapshots/${period}/close`, {});
  }

  /**
   * @param period Period YYYYMM.
   * @returns Debtor rows of the period.
   */
  getSlikRows(period: string): Observable<any> {
    return this.http.get(`/v2/slik-snapshots/${period}/rows`);
  }

  /**
   * @param period Period YYYYMM.
   * @returns Tie-out result (match, frozen, live, detail).
   */
  validateSlikPeriod(period: string): Observable<any> {
    return this.http.get(`/v2/slik-snapshots/${period}/validate`);
  }

  /**
   * @param period Period YYYYMM.
   * @returns Submit result.
   */
  submitSlikPeriod(period: string): Observable<any> {
    return this.http.post(`/v2/slik-snapshots/${period}/submit`, {});
  }

  /**
   * Downloads the IDI-layout extract through the authenticated client.
   * @param period Period YYYYMM.
   */
  downloadSlikExtract(period: string): void {
    this.http.get(`/v2/slik-snapshots/${period}/extract`, { responseType: 'blob' }).subscribe((blob: Blob) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `slik-${period}.txt`;
      anchor.click();
      URL.revokeObjectURL(url);
    });
  }

  /**
   * Downloads the goAML XML through the authenticated client (an anchor
   * alone would miss the Authorization header).
   * @param reportId Report id.
   */
  downloadReport(reportId: number): void {
    this.http.get(`/v2/aml-reports/${reportId}/file`, { responseType: 'blob' }).subscribe((blob: Blob) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `aml-report-${reportId}.xml`;
      anchor.click();
      URL.revokeObjectURL(url);
    });
  }
}
