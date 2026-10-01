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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Custom Services */
import { PaymentsService } from '../payments.service';

/**
 * Issue a virtual account component. Expected amount empty means
 * open-amount; fee defaults to zero.
 */
@Component({
  selector: 'mifosx-create-va',
  templateUrl: './create-va.component.html',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatButton
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateVaComponent implements OnInit {
  private paymentsService = inject(PaymentsService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  /** VA form. */
  vaForm: FormGroup;

  ngOnInit() {
    this.vaForm = this.formBuilder.group({
      customerRef: [''],
      name: [
        '',
        Validators.required
      ],
      expectedAmount: [null],
      feeAmount: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],
      expiresOn: [null]
    });
  }

  /**
   * Submits the VA form; dates serialize to YYYY-MM-DD.
   */
  submit() {
    const raw = this.vaForm.getRawValue();
    const payload = {
      ...raw,
      expiresOn: raw.expiresOn ? raw.expiresOn.toISOString().slice(0, 10) : null
    };
    this.paymentsService
      .issueVa(payload)
      .pipe(take(1))
      .subscribe(() => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }
}
