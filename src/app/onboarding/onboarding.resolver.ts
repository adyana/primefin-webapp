/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/** rxjs Imports */
import { Observable, catchError, of } from 'rxjs';

/** Custom Services */
import { OnboardingService } from './onboarding.service';

/**
 * Applications data resolver (empty page when unreachable).
 */
@Injectable()
export class ApplicationsResolver {
  private onboardingService = inject(OnboardingService);

  /**
   * Returns the applications page.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.onboardingService.listApplications().pipe(catchError(() => of({ pageItems: [] })));
  }
}

/**
 * Approval queue data resolver (empty page when unreachable).
 */
@Injectable()
export class ApprovalQueueResolver {
  private onboardingService = inject(OnboardingService);

  /**
   * Returns applications waiting at APPROVAL.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    return this.onboardingService.listApplications('APPROVAL').pipe(catchError(() => of({ pageItems: [] })));
  }
}

/**
 * Application board data resolver (null when unreachable).
 */
@Injectable()
export class ApplicationBoardResolver {
  private onboardingService = inject(OnboardingService);
  private route = inject(ActivatedRoute);

  /**
   * Returns the board for the routed application.
   * @returns {Observable<any>}
   */
  resolve(): Observable<any> {
    const id = Number(this.route.snapshot.params['id']);
    if (!id) {
      return of(null);
    }
    return this.onboardingService.getBoard(id).pipe(catchError(() => of(null)));
  }
}
