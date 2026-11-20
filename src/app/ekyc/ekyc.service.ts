/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0.
 */
/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

/** Custom Models */
import { EkycSession } from './models/ekyc-session.model';

/**
 * e-KYC service.
 * Calls the backend /api/v2/ekyc endpoints.
 */
@Injectable({
  providedIn: 'root'
})
export class EkycService {
  private http = inject(HttpClient);

  /**
   * Get e-KYC configuration (adapter, thresholds, re-attempt limits).
   * Gracefully returns empty config on failure so route navigation is not blocked.
   */
  getConfig(): Observable<EkycSession> {
    return this.http.get<EkycSession>('/v2/ekyc/config').pipe(
      catchError(() => of({} as EkycSession))
    );
  }

  /**
   * Create a new e-KYC onboarding session.
   * @param nik National Identity Number (KTP)
   */
  createSession(nik: string): Observable<EkycSession> {
    const params = new HttpParams().set('nik', nik);
    return this.http.post<EkycSession>('/v2/ekyc/sessions', null, { params });
  }

  /**
   * Get e-KYC session status.
   * @param token Session token
   */
  getSession(token: string): Observable<EkycSession> {
    return this.http.get<EkycSession>(`/v2/ekyc/sessions/${token}`);
  }

  /**
   * Submit NIK verification.
   * @param token Session token
   * @param nik National Identity Number
   */
  submitNik(token: string, nik: string): Observable<EkycSession> {
    return this.http.post<EkycSession>(`/v2/ekyc/sessions/${token}/nik`, null, {
      params: new HttpParams().set('nik', nik)
    });
  }

  /**
   * Submit face match / liveness.
   * @param token Session token
   * @param selfieBase64 Base64-encoded selfie image
   */
  submitFace(token: string, selfieBase64: string): Observable<EkycSession> {
    return this.http.post<EkycSession>(`/v2/ekyc/sessions/${token}/face`, null, {
      params: new HttpParams().set('selfie', selfieBase64)
    });
  }

  /**
   * Upload supporting documents.
   * @param token Session token
   * @param documentBase64s Base64-encoded document images
   */
  submitDocuments(token: string, documentBase64s: string[]): Observable<EkycSession> {
    return this.http.post<EkycSession>(`/v2/ekyc/sessions/${token}/documents`, null, {
      params: new HttpParams().set('documents', documentBase64s.join(','))
    });
  }

  /**
   * Final submit the e-KYC session.
   * @param token Session token
   */
  finalSubmit(token: string): Observable<EkycSession> {
    return this.http.post<EkycSession>(`/v2/ekyc/sessions/${token}/submit`, null);
  }

  /**
   * Abandon the e-KYC session.
   * @param token Session token
   */
  abandon(token: string): Observable<EkycSession> {
    return this.http.request('DELETE', `/v2/ekyc/sessions/${token}`, {
      body: {},
      observe: 'response'
    }) as unknown as Observable<EkycSession>;
  }
}
