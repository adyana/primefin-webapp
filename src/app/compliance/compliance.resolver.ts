/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** rxjs Imports */
import { Observable, catchError, of } from 'rxjs';

/** Custom Services */
import { ComplianceService } from './compliance.service';

/**
 * Deny lists data resolver (empty list when the backend is unreachable).
 */
@Injectable()
export class ComplianceListsResolver {
  private complianceService = inject(ComplianceService);

  /**
   * Returns all deny lists.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.complianceService.getLists().pipe(catchError(() => of([])));
  }
}

/**
 * Monitoring rules data resolver (empty list when unreachable).
 */
@Injectable()
export class AmlRulesResolver {
  private complianceService = inject(ComplianceService);

  /**
   * Returns all monitoring rules.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.complianceService.getAmlRules().pipe(catchError(() => of([])));
  }
}

/**
 * Open cases data resolver (empty list when unreachable).
 */
@Injectable()
export class AmlCasesResolver {
  private complianceService = inject(ComplianceService);

  /**
   * Returns open suspicious cases.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.complianceService.getAmlCases('OPEN').pipe(catchError(() => of([])));
  }
}

/**
 * Reports data resolver (empty list when unreachable).
 */
@Injectable()
export class AmlReportsResolver {
  private complianceService = inject(ComplianceService);

  /**
   * Returns all reports, newest first.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.complianceService.getAmlReports().pipe(catchError(() => of([])));
  }
}

/**
 * SLIK snapshots data resolver (empty list when unreachable).
 */
@Injectable()
export class SlikSnapshotsResolver {
  private complianceService = inject(ComplianceService);

  /**
   * Returns all snapshots, newest first.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.complianceService.getSlikSnapshots().pipe(catchError(() => of([])));
  }
}

/**
 * Filing submissions data resolver (empty list when unreachable).
 */
@Injectable()
export class FilingsResolver {
  private complianceService = inject(ComplianceService);

  /**
   * Returns all filings, newest first.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.complianceService.getFilings().pipe(catchError(() => of([])));
  }
}
