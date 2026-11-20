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
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { MatStepper, MatStep, MatStepHeader, MatStepContent } from '@angular/material/stepper';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EkycService } from '../ekyc.service';
import { EkycSession } from '../models/ekyc-session.model';

/**
 * e-KYC Onboarding Page Component.
 * Multi-step customer onboarding: NIK verification, face match,
 * document upload, final submit and status tracking.
 */
@Component({
  selector: 'mifosx-ekyc-page',
  templateUrl: './ekyc-page.component.html',
  styleUrls: ['./ekyc-page.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatStepper,
    MatStep,
    MatStepHeader,
    MatStepContent,
    MatButton,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatSelect,
    MatOption,
    MatIcon,
    FormsModule,
    ReactiveFormsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EkycPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ekycService = inject(EkycService);
  private destroyRef = inject(DestroyRef);

  /** e-KYC session data from resolve. */
  ekycConfig: any;
  /** Current session token (set after session creation). */
  sessionToken: string | null = null;
  /** Current session status. */
  sessionStatus: string | null = null;
  /** Current step index (0 = consent, 1 = NIK, 2 = face, 3 = documents, 4 = submit, 5 = status). */
  currentStep = 0;
  /** Whether a submission is in flight. */
  submitting = false;
  /** Error message (if any). */
  error: string | null = null;

  /** NIK form value. */
  nik: string = '';

  /**
   * Initialises the component from resolved route data.
   */
  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { ekyc: any }) => {
      this.ekycConfig = data.ekyc;
    });
  }

  /**
   * Angular lifecycle hook.
   */
  ngOnInit() {
    // Auto-create a session on load if we don't have a token yet.
    if (!this.sessionToken) {
      this.createSession();
    }
  }

  /**
   * Creates a new e-KYC session.
   */
  createSession() {
    this.submitting = true;
    this.error = null;
    this.ekycService.createSession(this.nik || '').subscribe({
      next: (session: EkycSession) => {
        this.sessionToken = session.token;
        this.sessionStatus = session.status;
        this.submitting = false;
        this.currentStep = 1; // move to NIK step
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Failed to create e-KYC session';
        this.submitting = false;
      }
    });
  }

  /**
   * Submits NIK verification.
   */
  submitNik() {
    if (!this.sessionToken || !this.nik) return;
    this.submitting = true;
    this.error = null;
    this.ekycService.submitNik(this.sessionToken, this.nik).subscribe({
      next: (session: EkycSession) => {
        this.sessionStatus = session.status;
        this.submitting = false;
        this.currentStep = 2; // move to face step
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'NIK verification failed';
        this.submitting = false;
      }
    });
  }

  /**
   * Submits face match.
   */
  submitFace() {
    if (!this.sessionToken) return;
    this.submitting = true;
    this.error = null;
    this.ekycService.submitFace(this.sessionToken, '').subscribe({
      next: (session: EkycSession) => {
        this.sessionStatus = session.status;
        this.submitting = false;
        this.currentStep = 3; // move to documents step
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Face match failed';
        this.submitting = false;
      }
    });
  }

  /**
   * Submits documents.
   */
  submitDocuments() {
    if (!this.sessionToken) return;
    this.submitting = true;
    this.error = null;
    this.ekycService.submitDocuments(this.sessionToken, []).subscribe({
      next: (session: EkycSession) => {
        this.sessionStatus = session.status;
        this.submitting = false;
        this.currentStep = 4; // move to final submit step
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Document upload failed';
        this.submitting = false;
      }
    });
  }

  /**
   * Final submits the e-KYC session.
   */
  finalSubmit() {
    if (!this.sessionToken) return;
    this.submitting = true;
    this.error = null;
    this.ekycService.finalSubmit(this.sessionToken).subscribe({
      next: (session: EkycSession) => {
        this.sessionStatus = session.status;
        this.submitting = false;
        this.currentStep = 5; // move to status step
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Final submit failed';
        this.submitting = false;
      }
    });
  }

  /**
   * Refreshes session status.
   */
  refreshStatus() {
    if (!this.sessionToken) return;
    this.ekycService.getSession(this.sessionToken).subscribe({
      next: (session: EkycSession) => {
        this.sessionStatus = session.status;
      }
    });
  }

  /**
   * Abandons the session and returns to consent step.
   */
  abandonSession() {
    if (!this.sessionToken) return;
    this.submitting = true;
    this.ekycService.abandon(this.sessionToken).subscribe({
      next: () => {
        this.sessionToken = null;
        this.sessionStatus = null;
        this.submitting = false;
        this.currentStep = 0;
      },
      error: () => {
        this.submitting = false;
      }
    });
  }
}
