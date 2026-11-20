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
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatError, MatSuffix, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { Router, ActivatedRoute } from '@angular/router';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { ComplaintsService } from '../complaints.service';

/**
 * File Complaint Page Component.
 * Customer-facing complaint filing form.
 */
@Component({
  selector: 'mifosx-file-complaint-page',
  templateUrl: './file-complaint-page.component.html',
  styleUrls: ['./file-complaint-page.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ReactiveFormsModule,
    MatButton,
    MatFormField,
    MatLabel,
    MatError,
    MatSuffix,
    MatHint,
    MatInput,
    MatSelect,
    MatOption,
    MatIcon
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileComplaintPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private complaintsService = inject(ComplaintsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  /** Complaint filing form. */
  form: FormGroup;
  /** Whether submission is in flight. */
  submitting = false;
  /** Error message. */
  error: string | null = null;
  /** Success message. */
  success: string | null = null;
  /** Whether filing succeeded. */
  filed = false;
  /** Filed complaint ID. */
  filedId: number | null = null;

  /** Complaint type options. */
  complaintTypes = [
    'GENERAL',
    'BILLING',
    'SERVICE',
    'FRAUD'
  ];
  /** Channel options. */
  channels = [
    'BRANCH',
    'PHONE',
    'EMAIL',
    'WEB',
    'MOBILE'
  ];
  /** Priority options. */
  priorities = [
    'LOW',
    'MEDIUM',
    'HIGH'
  ];

  constructor() {
    this.form = this.fb.group({
      clientId: [
        '',
        [
          Validators.required,
          Validators.min(1)
        ]
      ],
      loanId: [''],
      complaintType: [
        'GENERAL',
        [Validators.required]
      ],
      subject: [
        '',
        [
          Validators.required,
          Validators.maxLength(200)
        ]
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.maxLength(1000)
        ]
      ],
      channel: [
        'WEB',
        [Validators.required]
      ],
      priority: [
        'MEDIUM',
        [Validators.required]
      ]
    });
  }

  ngOnInit() {
    // Pre-fill clientId from query param if provided
    this.route.queryParams.subscribe((params) => {
      if (params['clientId']) {
        this.form.patchValue({ clientId: params['clientId'] });
      }
    });
  }

  /**
   * File the complaint.
   */
  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.error = null;
    this.success = null;

    const request = this.form.value;
    this.complaintsService.fileComplaint(request).subscribe({
      next: (result) => {
        this.submitting = false;
        this.filed = true;
        this.filedId = result.resourceId;
        this.success = `Complaint filed successfully. Reference ID: ${result.resourceId}`;
        this.form.disable();
      },
      error: (err: any) => {
        this.submitting = false;
        this.error = err?.error?.message || 'Failed to file complaint. Please try again.';
      }
    });
  }

  /**
   * File another complaint.
   */
  fileAnother() {
    this.filed = false;
    this.success = null;
    this.error = null;
    this.form.enable();
    this.form.reset({
      clientId: '',
      loanId: '',
      complaintType: 'GENERAL',
      subject: '',
      description: '',
      channel: 'WEB',
      priority: 'MEDIUM'
    });
  }

  /**
   * Get error message for a form control.
   * @param controlName Control name
   */
  getError(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control || !control.errors || !control.touched) return '';
    if (control.errors['required']) return `${controlName} is required`;
    if (control.errors['minlength']) return `Minimum length is ${control.errors['minlength'].requiredLength}`;
    if (control.errors['maxlength']) return `Maximum length is ${control.errors['maxlength'].requiredLength}`;
    if (control.errors['min']) return `Value must be at least ${control.errors['min'].min}`;
    return 'Invalid value';
  }
}
