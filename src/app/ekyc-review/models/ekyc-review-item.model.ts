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

/**
 * e-KYC review queue item model.
 * Returned by /api/v2/ekyc/review-queue.
 */
export interface EkycReviewItem {
  id: string;
  token: string;
  nik: string;
  status: string;
  nextStep: string;
  attemptsRemaining: number;
  clientName?: string;
  clientId?: number;
  createdAt: string;
  updatedAt?: string;
  adapter: string;
}
