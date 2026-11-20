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
import { ChangeDetectionStrategy, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { EkycReviewService } from '../ekyc-review.service';

/**
 * e-KYC Review Detail Page Component.
 * Officer detail view of one e-KYC session with Approve / Reject /
 * Request Re-attempt decision buttons.
 */
@Component({
  selector: 'mifosx-ekyc-review-detail-page',
  templateUrl: './review-page.component.html',
  styleUrls: ['./review-page.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatButton,
    MatFormField,
    MatLabel,
    MatInput,
    MatIcon,
    FormsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EkycReviewDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ekycReviewService = inject(EkycReviewService);
  private destroyRef = inject(DestroyRef);

  /** Review item being viewed. */
  item: any = null;
  /** Whether a decision is in flight. */
  submitting = false;
  /** Error message. */
  error: string | null = null;
  /** Rejection / re-attempt reason text. */
  reason: string = '';

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadItem(id);
      }
    });
    // Handle quick-action query params (e.g. ?action=approve)
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const action = params['action'];
      if (action && this.item) {
        this.executeQuickAction(action);
      }
    });
  }

  ngOnInit() {
    if (!this.item) {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.loadItem(id);
      }
    }
  }

  /**
   * Load a review item by ID.
   * @param id Review item ID
   */
  loadItem(id: string) {
    // Since the backend review-queue endpoint returns a list, we filter
    // client-side. In production this would be a dedicated GET by ID.
    this.ekycReviewService.getReviewQueue().subscribe({
      next: (items: any[]) => {
        this.item = items.find((i) => i.id === id) || null;
        if (!this.item) {
          this.error = `Review item ${id} not found`;
        }
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Failed to load review item';
      }
    });
  }

  /**
   * Approve the session.
   */
  approve() {
    if (!this.item?.id) return;
    this.submitting = true;
    this.error = null;
    this.ekycReviewService.approve(this.item.id, this.reason || undefined).subscribe({
      next: () => {
        this.submitting = false;
        this.item.status = 'APPROVED';
        this.item.updatedAt = new Date().toISOString();
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Approve failed';
        this.submitting = false;
      }
    });
  }

  /**
   * Reject the session.
   */
  reject() {
    if (!this.item?.id || !this.reason) {
      this.error = 'A rejection reason is required';
      return;
    }
    this.submitting = true;
    this.error = null;
    this.ekycReviewService.reject(this.item.id, this.reason).subscribe({
      next: () => {
        this.submitting = false;
        this.item.status = 'REJECTED';
        this.item.updatedAt = new Date().toISOString();
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Reject failed';
        this.submitting = false;
      }
    });
  }

  /**
   * Request a re-attempt.
   */
  requestReattempt() {
    if (!this.item?.id || !this.reason) {
      this.error = 'A reason is required for re-attempt';
      return;
    }
    this.submitting = true;
    this.error = null;
    this.ekycReviewService.requestReattempt(this.item.id, this.reason).subscribe({
      next: () => {
        this.submitting = false;
        this.item.status = 'RE_ATTEMPT_REQUESTED';
        this.item.updatedAt = new Date().toISOString();
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Re-attempt request failed';
        this.submitting = false;
      }
    });
  }

  /**
   * Execute a quick action from query params.
   * @param action Action name
   */
  private executeQuickAction(action: string) {
    if (action === 'approve') {
      this.approve();
    }
  }

  /**
   * Return to the review queue.
   */
  backToQueue() {
    this.router.navigate(['/ekyc-review']);
  }
}
