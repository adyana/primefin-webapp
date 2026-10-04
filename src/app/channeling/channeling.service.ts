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
 * Channeling service: partner registry + product/rate/cap/window config.
 * Served by the fineract-channel module under /api/v2/channel-* (PrimeFin P0).
 */
@Injectable({
  providedIn: 'root'
})
export class ChannelingService {
  private http = inject(HttpClient);

  /**
   * @returns All registered channel partners.
   */
  getPartners(): Observable<any> {
    return this.http.get('/v2/channel-partners');
  }

  /**
   * @param partner Partner payload (code, name, status, contact, sftpUsername, pgpKeyRef).
   * @returns Creation result with resourceId.
   */
  createPartner(partner: any): Observable<any> {
    return this.http.post('/v2/channel-partners', partner);
  }

  /**
   * @param partnerId Partner id.
   * @param partner Partner payload.
   * @returns Update result.
   */
  updatePartner(partnerId: number, partner: any): Observable<any> {
    return this.http.put(`/v2/channel-partners/${partnerId}`, partner);
  }

  /**
   * @param partnerId Partner id.
   * @returns Deletion result.
   */
  deletePartner(partnerId: number): Observable<any> {
    return this.http.delete(`/v2/channel-partners/${partnerId}`);
  }

  /**
   * @param partnerId Partner id (optional; all mappings when omitted).
   * @returns Product mappings (partnerProductCode -> ourProductId).
   */
  getProducts(partnerId?: number): Observable<any> {
    let params = new HttpParams();
    if (partnerId !== undefined) {
      params = params.set('partnerId', partnerId.toString());
    }
    return this.http.get('/v2/channel-products', { params });
  }

  /**
   * @param product Mapping payload (partnerId, partnerProductCode, ourProductId).
   * @returns Creation result with resourceId.
   */
  createProduct(product: any): Observable<any> {
    return this.http.post('/v2/channel-products', product);
  }

  /**
   * @param mappingId Mapping id.
   * @returns Deletion result.
   */
  deleteProduct(mappingId: number): Observable<any> {
    return this.http.delete(`/v2/channel-products/${mappingId}`);
  }

  /**
   * @param partnerProductId Mapping id (optional; all bands when omitted).
   * @returns Rate bands in bps.
   */
  getRateBands(partnerProductId?: number): Observable<any> {
    let params = new HttpParams();
    if (partnerProductId !== undefined) {
      params = params.set('partnerProductId', partnerProductId.toString());
    }
    return this.http.get('/v2/channel-rate-bands', { params });
  }

  /**
   * @param band Band payload (partnerProductId, band, bps).
   * @returns Creation result with resourceId.
   */
  createRateBand(band: any): Observable<any> {
    return this.http.post('/v2/channel-rate-bands', band);
  }

  /**
   * @param bandId Band id.
   * @returns Deletion result.
   */
  deleteRateBand(bandId: number): Observable<any> {
    return this.http.delete(`/v2/channel-rate-bands/${bandId}`);
  }

  /**
   * @returns All amount caps (GLOBAL + PARTNER).
   */
  getCaps(): Observable<any> {
    return this.http.get('/v2/channel-caps');
  }

  /**
   * @param cap Cap payload (scope, partnerId, maxAmount).
   * @returns Creation result with resourceId.
   */
  createCap(cap: any): Observable<any> {
    return this.http.post('/v2/channel-caps', cap);
  }

  /**
   * @param capId Cap id.
   * @returns Deletion result.
   */
  deleteCap(capId: number): Observable<any> {
    return this.http.delete(`/v2/channel-caps/${capId}`);
  }

  /**
   * @param partnerId Partner id (optional; all windows when omitted).
   * @returns Processing windows per stream.
   */
  getWindows(partnerId?: number): Observable<any> {
    let params = new HttpParams();
    if (partnerId !== undefined) {
      params = params.set('partnerId', partnerId.toString());
    }
    return this.http.get('/v2/channel-windows', { params });
  }

  /**
   * @param window Window payload (partnerId, stream, startTime, endTime).
   * @returns Creation result with resourceId.
   */
  createWindow(window: any): Observable<any> {
    return this.http.post('/v2/channel-windows', window);
  }

  /**
   * @param windowId Window id.
   * @returns Deletion result.
   */
  deleteWindow(windowId: number): Observable<any> {
    return this.http.delete(`/v2/channel-windows/${windowId}`);
  }

  /**
   * @param partnerCode Partner code (optional; all files when omitted).
   * @returns Staged channel files with row counts.
   */
  getFiles(partnerCode?: string): Observable<any> {
    let params = new HttpParams();
    if (partnerCode !== undefined) {
      params = params.set('partnerCode', partnerCode);
    }
    return this.http.get('/v2/channel-files', { params });
  }

  /**
   * @param fileId Staged file id.
   * @returns Staged rows of the file.
   */
  /**
   * @param from ISO date start.
   * @param to ISO date end.
   * @param granularity DAY, MONTH or YEAR.
   * @returns Per-partner file traffic series for the dashboard chart.
   */
  getTraffic(from: string, to: string, granularity: string): Observable<any> {
    const params = new HttpParams().set('from', from).set('to', to).set('granularity', granularity);
    return this.http.get('/v2/channel-files/traffic', { params });
  }

  getFileRows(fileId: number): Observable<any> {
    return this.http.get(`/v2/channel-files/${fileId}/rows`);
  }

  /**
   * @param from ISO date start.
   * @param to ISO date end, exclusive.
   * @returns Window totals plus per-day disbursed/received counts and amounts.
   */
  getMovement(from: string, to: string): Observable<any> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get('/v2/channel-dashboard/summary', { params });
  }
}
