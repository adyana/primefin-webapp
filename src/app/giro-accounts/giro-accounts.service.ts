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
import { Observable } from 'rxjs';

/** Custom Models */
import { GiroAccount, GiroAccountData, GiroAccountDetail } from './giro-accounts.model';

/**
 * Giro Accounts service.
 */
@Injectable({
  providedIn: 'root'
})
export class GiroAccountsService {
  private http = inject(HttpClient);
  private baseUrl = '/api/v1';

  /**
   * Get all giro accounts with pagination
   * @param pageNumber Page number (1-based)
   * @param pageSize Page size
   * @param sortBy Sort field
   * @param sortOrder Sort order (asc/desc)
   * @returns Observable of giro account data
   */
  getAllGiroAccounts(
    pageNumber: number = 1,
    pageSize: number = 10,
    sortBy: string = 'openedDate',
    sortOrder: string = 'desc'
  ): Observable<GiroAccountData> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder);

    return this.http.get<GiroAccountData>(`${this.baseUrl}/giroaccounts`, { params });
  }

  /**
   * Get a single giro account by ID
   * @param id Giro account ID
   * @returns Observable of giro account detail
   */
  getGiroAccount(id: number): Observable<GiroAccountDetail> {
    return this.http.get<GiroAccountDetail>(`${this.baseUrl}/giroaccounts/${id}`);
  }

  /**
   * Get giro accounts for a specific client
   * @param clientId Client ID
   * @returns Observable of giro account data
   */
  getGiroAccountsByClient(clientId: number): Observable<GiroAccountData> {
    return this.http.get<GiroAccountData>(`${this.baseUrl}/clients/${clientId}/giroaccounts`);
  }
}
