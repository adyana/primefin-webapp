/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { PaymentsService } from './payments.service';

/**
 * Payment rails config data resolver.
 */
@Injectable()
export class PaymentRailsResolver {
  private paymentsService = inject(PaymentsService);

  /**
   * Returns all seeded payment rails.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.paymentsService.getRails();
  }
}

/**
 * Payment throughput data resolver.
 */
@Injectable()
export class PaymentThroughputResolver {
  private paymentsService = inject(PaymentsService);

  /**
   * Returns today's per-rail throughput.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.paymentsService.getThroughput();
  }
}

/**
 * Open reconciliation breaks data resolver.
 */
@Injectable()
export class PaymentBreaksResolver {
  private paymentsService = inject(PaymentsService);

  /**
   * Returns OPEN reconciliation breaks.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.paymentsService.getBreaks('OPEN');
  }
}

/**
 * Fraud-SLA breaches data resolver.
 */
@Injectable()
export class PaymentFraudSlaResolver {
  private paymentsService = inject(PaymentsService);

  /**
   * Returns fraud holds past the 24h SLA.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.paymentsService.getFraudSla();
  }
}

/**
 * Single transfer batch data resolver.
 */
@Injectable()
export class PaymentBatchResolver {
  private paymentsService = inject(PaymentsService);

  /**
   * Returns one transfer batch by route id.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.paymentsService.getBatch(Number(route.paramMap.get('id')));
  }
}

/**
 * Transfer batches data resolver.
 */
@Injectable()
export class PaymentBatchesResolver {
  private paymentsService = inject(PaymentsService);

  /**
   * Returns all transfer batches.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.paymentsService.getBatches();
  }
}
