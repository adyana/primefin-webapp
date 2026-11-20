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
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { ComplaintManagementService } from '../complaint-management.service';

/**
 * Complaint Manage Page Component.
 * Officer-facing complaint detail with Assign / Resolve / Escalate actions.
 */
@Component({
  selector: 'mifosx-complaint-manage-page',
  templateUrl: './complaint-manage-page.component.html',
  styleUrls: ['./complaint-manage-page.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ReactiveFormsModule,
    MatButton,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatIcon
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComplaintManagePageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private complaintManagementService = inject(ComplaintManagementService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  /** Complaint data. */
  complaint: any = null;
  /** Whether submission is in flight. */
  submitting = false;
  /** Error message. */
  error: string | null = null;
  /** Success message. */
  success: string | null = null;
  /** Notes form for resolve/escalate. */
  notesForm: FormGroup;

  constructor() {
    this.notesForm = this.fb.group({
      notes: [
        '',
        [
          Validators.required,
          Validators.maxLength(500)
        ]
      ]
    });

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
    // Filter from resolved data (officer queue already loaded all complaints)
    this.route.data.subscribe((data: { complaints: any[] }) => {
      const complaints = data.complaints ?? [];
      this.complaint = complaints.find((c) => c.id === id) || null;
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
   * Check if action is available for current status.
   * @param action Action name
   */
  isActionAvailable(action: string): boolean {
    if (!this.complaint) return false;
    const status = this.complaint.status;
    const terminal = [
      'RESOLVED',
      'CLOSED'
    ];
    if (terminal.includes(status)) return false;

    switch (action) {
      case 'assign':
        return [
          'OPEN',
          'ASSIGNED',
          'ESCALATED'
        ].includes(status);
      case 'resolve':
        return [
          'OPEN',
          'ASSIGNED',
          'ESCALATED'
        ].includes(status);
      case 'escalate':
        return [
          'OPEN',
          'ASSIGNED'
        ].includes(status);
      default:
        return false;
    }
  }

  /**
   * Assign complaint to an officer.
   */
  assignComplaint() {
    if (!this.complaint?.id) return;
    const assigneeId = prompt('Enter assignee officer ID:');
    if (!assigneeId) return;

    this.submitting = true;
    this.error = null;

    this.complaintManagementService.assignComplaint(this.complaint.id, { assigneeId: Number(assigneeId) }).subscribe({
      next: () => {
        this.submitting = false;
        this.success = 'Complaint assigned successfully';
        this.complaint.assigneeId = Number(assigneeId);
        this.complaint.status = 'ASSIGNED';
      },
      error: (err: any) => {
        this.submitting = false;
        this.error = err?.error?.message || 'Assign failed';
      }
    });
  }

  /**
   * Resolve complaint with notes.
   */
  resolveComplaint() {
    if (!this.complaint?.id) return;
    if (this.notesForm.invalid) {
      this.notesForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.error = null;

    this.complaintManagementService
      .resolveComplaint(this.complaint.id, { notes: this.notesForm.value.notes })
      .subscribe({
        next: () => {
          this.submitting = false;
          this.success = 'Complaint resolved successfully';
          this.complaint.status = 'RESOLVED';
        },
        error: (err: any) => {
          this.submitting = false;
          this.error = err?.error?.message || 'Resolve failed';
        }
      });
  }

  /**
   * Escalate complaint with notes.
   */
  escalateComplaint() {
    if (!this.complaint?.id) return;
    if (this.notesForm.invalid) {
      this.notesForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.error = null;

    this.complaintManagementService
      .escalateComplaint(this.complaint.id, { notes: this.notesForm.value.notes })
      .subscribe({
        next: () => {
          this.submitting = false;
          this.success = 'Complaint escalated successfully';
          this.complaint.status = 'ESCALATED';
        },
        error: (err: any) => {
          this.submitting = false;
          this.error = err?.error?.message || 'Escalate failed';
        }
      });
  }

  /**
   * Return to complaint queue.
   */
  backToQueue() {
    this.router.navigate(['/complaint-management']);
  }
}
