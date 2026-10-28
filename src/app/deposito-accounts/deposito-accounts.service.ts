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
import { DepositoAccount, DepositoAccountData, DepositoAccountDetail } from './deposito-accounts.model';

/**
 * Deposito Accounts service.
 */
@Injectable({
  providedIn: 'root'
})
export class DepositoAccountsService {
  private http = inject(HttpClient);
  private baseUrl = '/api/v1';

  /**
   * Get all deposito accounts with pagination
   * @param pageNumber Page number (1-based)
   * @param pageSize Page size
   * @param sortBy Sort field
   * @param sortOrder Sort order (asc/desc)
   * @returns Observable of deposito account data
   */
  getAllDepositoAccounts(
    pageNumber: number = 1,
    pageSize: number = 10,
    sortBy: string = 'openedDate',
    sortOrder: string = 'desc'
  ): Observable<DepositoAccountData> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder);

    return this.http.get<DepositoAccountData>(`${this.baseUrl}/depositoaccounts`, { params });
  }

  /**
   * Get a single deposito account by ID
   * @param id Deposito account ID
   * @returns Observable of deposito account detail
   */
  getDepositoAccount(id: number): Observable<DepositoAccountDetail> {
    return this.http.get<DepositoAccountDetail>(`${this.baseUrl}/depositoaccounts/${id}`);
  }

  /**
   * Get deposito accounts for a specific client
   * @param clientId Client ID
   * @returns Observable of deposito account data
   */
  getDepositoAccountsByClient(clientId: number): Observable<DepositoAccountData> {
    return this.http.get<DepositoAccountData>(`${this.baseUrl}/clients/${clientId}/depositoaccounts`);
  }
}
