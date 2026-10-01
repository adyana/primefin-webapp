/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Custom Services */
import { PaymentsService } from '../payments.service';

/**
 * Create automation schedule component.
 */
@Component({
  selector: 'mifosx-create-schedule',
  templateUrl: './create-schedule.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ReactiveFormsModule,
    RouterLink,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatSelect,
    MatOption,
    MatCheckbox,
    MatButton
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateScheduleComponent implements OnInit {
  private paymentsService = inject(PaymentsService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  /** Schedule form. */
  scheduleForm: FormGroup;

  ngOnInit() {
    this.scheduleForm = this.formBuilder.group({
      code: [
        '',
        Validators.required
      ],
      action: [
        'DISBURSE_BATCH',
        Validators.required
      ],
      rail: [''],
      amountOverride: [null],
      enabled: [false],
      intervalMinutes: [
        60,
        [
          Validators.required,
          Validators.min(1)
        ]
      ]
    });
  }

  /**
   * Submits the schedule form; blank rail means all rails.
   */
  submit() {
    const raw = this.scheduleForm.getRawValue();
    const payload = {
      ...raw,
      rail: raw.rail ? raw.rail : null
    };
    this.paymentsService
      .createSchedule(payload)
      .pipe(take(1))
      .subscribe(() => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }
}
