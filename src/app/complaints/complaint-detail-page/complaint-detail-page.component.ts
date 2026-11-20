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
import { MatIcon } from '@angular/material/icon';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Complaint Detail Page Component.
 * Customer-facing complaint detail view (read-only).
 */
@Component({
  selector: 'mifosx-complaint-detail-page',
  templateUrl: './complaint-detail-page.component.html',
  styleUrls: ['./complaint-detail-page.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatButton,
    MatIcon
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComplaintDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  /** Complaint data. */
  complaint: any = null;
  /** Error message. */
  error: string | null = null;
  /** Whether loading. */
  loading = true;

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadComplaint(Number(id));
      }
    });
  }

  ngOnInit() {
    if (!this.complaint) {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.loadComplaint(Number(id));
      }
    }
  }

  /**
   * Load complaint by ID.
   * @param id Complaint ID
   */
  loadComplaint(id: number) {
    this.loading = true;
    this.error = null;
    // Since we don't have a dedicated detail endpoint in the resolver,
    // we filter from the resolved list. In production this would be a
    // dedicated GET /v2/complaints/{id} call.
    this.route.data.subscribe((data: { complaints: any[] }) => {
      const complaints = data.complaints ?? [];
      this.complaint = complaints.find((c) => c.id === id) || null;
      this.loading = false;
      if (!this.complaint) {
        this.error = `Complaint ${id} not found`;
      }
    });
  }

  /**
   * Get status class for styling.
   * @param status Complaint status
   */
  statusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  /**
   * Return to complaint list.
   */
  backToList() {
    this.router.navigate(['/complaints']);
  }
}
