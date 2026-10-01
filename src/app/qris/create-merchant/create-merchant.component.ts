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
import { QrisService } from '../qris.service';

/**
 * Onboard a QRIS merchant component. MCC is validated against the board
 * exclusion list server-side; NMID is minted locally in SAMPLE format.
 */
@Component({
  selector: 'mifosx-create-merchant',
  templateUrl: './create-merchant.component.html',
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
export class CreateMerchantComponent implements OnInit {
  private qrisService = inject(QrisService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  /** Merchant form. */
  merchantForm: FormGroup;

  ngOnInit() {
    this.merchantForm = this.formBuilder.group({
      code: [
        '',
        Validators.required
      ],
      name: [
        '',
        Validators.required
      ],
      mcc: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]{4}$')
        ]
      ],
      segment: [
        'UMI',
        Validators.required
      ],
      location: [''],
      capAmount: [null],
      shariaCompliant: [false],
      settlementAccount: [''],
      agentId: [null]
    });
  }

  /**
   * Submits the merchant form with a fresh idempotency key.
   */
  submit() {
    const payload = {
      ...this.merchantForm.getRawValue(),
      idempotencyKey: crypto.randomUUID()
    };
    this.qrisService
      .createMerchant(payload)
      .pipe(take(1))
      .subscribe(() => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }
}
