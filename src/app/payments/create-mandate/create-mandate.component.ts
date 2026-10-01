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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Custom Services */
import { PaymentsService } from '../payments.service';

/**
 * Create DDT autopay mandate component.
 */
@Component({
  selector: 'mifosx-create-mandate',
  templateUrl: './create-mandate.component.html',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatButton
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateMandateComponent implements OnInit {
  private paymentsService = inject(PaymentsService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  /** Mandate form. */
  mandateForm: FormGroup;

  ngOnInit() {
    this.mandateForm = this.formBuilder.group({
      reference: [
        '',
        Validators.required
      ],
      debtorAccount: [
        '',
        Validators.required
      ],
      creditorAccount: [
        '',
        Validators.required
      ],
      maxAmount: [
        null,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],
      currency: ['IDR'],
      frequency: [
        'MONTHLY',
        Validators.required
      ],
      nextDueOn: [null]
    });
  }

  /**
   * Submits the mandate form; dates serialize to YYYY-MM-DD.
   */
  submit() {
    const raw = this.mandateForm.getRawValue();
    const payload = {
      ...raw,
      nextDueOn: raw.nextDueOn ? raw.nextDueOn.toISOString().slice(0, 10) : null
    };
    this.paymentsService
      .createMandate(payload)
      .pipe(take(1))
      .subscribe(() => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }
}
