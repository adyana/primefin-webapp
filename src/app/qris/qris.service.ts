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
 * QRIS service: outlet registry, static codes, MDR-rated transactions.
 * Served by the fineract-qris module under /api/v2/qris-* (PrimeFin QR1).
 */
@Injectable({
  providedIn: 'root'
})
export class QrisService {
  private http = inject(HttpClient);

  /**
   * @param status Merchant status filter (optional; all merchants when omitted).
   * @returns All onboarded merchants.
   */
  getMerchants(status?: string): Observable<any> {
    let params = new HttpParams();
    if (status !== undefined) {
      params = params.set('status', status);
    }
    return this.http.get('/v2/qris-merchants', { params });
  }

  /**
   * @param merchantId Merchant id.
   * @returns One merchant.
   */
  getMerchant(merchantId: number): Observable<any> {
    return this.http.get(`/v2/qris-merchants/${merchantId}`);
  }

  /**
   * @param merchant Merchant payload (idempotencyKey, code, name, mcc, segment, location, capAmount, shariaCompliant, settlementAccount, agentId).
   * @returns Creation result with resourceId.
   */
  createMerchant(merchant: any): Observable<any> {
    return this.http.post('/v2/qris-merchants', merchant);
  }

  /**
   * @param merchantId Merchant id.
   * @param merchant Merchant payload (name, location, capAmount, settlementAccount, status).
   * @returns Updated merchant.
   */
  updateMerchant(merchantId: number, merchant: any): Observable<any> {
    return this.http.put(`/v2/qris-merchants/${merchantId}`, merchant);
  }

  /**
   * @param merchantId Merchant id.
   * @returns Static codes, newest first.
   */
  getCodes(merchantId: number): Observable<any> {
    return this.http.get(`/v2/qris-merchants/${merchantId}/codes`);
  }

  /**
   * @param merchantId Merchant id.
   * @returns Issuance result with resourceId.
   */
  issueCode(merchantId: number): Observable<any> {
    return this.http.post(`/v2/qris-merchants/${merchantId}/codes/issue`, {});
  }

  /**
   * @param merchantId Merchant id.
   * @param type Transaction type filter (optional; all types when omitted).
   * @returns Merchant transactions, newest first.
   */
  getTransactions(merchantId: number, type?: string): Observable<any> {
    let params = new HttpParams();
    if (type !== undefined) {
      params = params.set('type', type);
    }
    return this.http.get('/v2/qris-transactions', { params: params.set('merchantId', merchantId.toString()) });
  }

  /**
   * @param merchantId Merchant id.
   * @param sale Sale payload (idempotencyKey, amount, currency).
   * @returns Sale result with resourceId.
   */
  createSale(merchantId: number, sale: any): Observable<any> {
    return this.http.post(`/v2/qris-transactions/merchants/${merchantId}/sales`, sale);
  }

  /**
   * @param transactionId Sale id.
   * @param reversal Reversal payload (idempotencyKey, reason).
   * @returns Void result with resourceId.
   */
  voidTransaction(transactionId: number, reversal: any): Observable<any> {
    return this.http.post(`/v2/qris-transactions/${transactionId}/void`, reversal);
  }

  /**
   * @param transactionId Sale id.
   * @param reversal Reversal payload (idempotencyKey, amount, reason).
   * @returns Refund result with resourceId.
   */
  refundTransaction(transactionId: number, reversal: any): Observable<any> {
    return this.http.post(`/v2/qris-transactions/${transactionId}/refund`, reversal);
  }

  /**
   * @returns MDR bands (BI rate + margins, all parameterized).
   */
  getMdrRules(): Observable<any> {
    return this.http.get('/v2/qris-mdr-rules');
  }

  /**
   * @param ruleId Rule id.
   * @param rule Rule payload (biRateBps, marginBps, agentMarginBps).
   * @returns Updated rule.
   */
  updateMdrRule(ruleId: number, rule: any): Observable<any> {
    return this.http.put(`/v2/qris-mdr-rules/${ruleId}`, rule);
  }
}
