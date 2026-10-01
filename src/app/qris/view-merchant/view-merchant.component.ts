/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { take } from 'rxjs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { QrisCodesTabComponent } from './codes-tab/codes-tab.component';
import { QrisTransactionsTabComponent } from './transactions-tab/transactions-tab.component';

/** Custom Services */
import { QrisService } from '../qris.service';

/**
 * Merchant detail shell with sale/void/refund actions and codes +
 * transactions tabs. Reversals unwind MDR in full (board ruling 4).
 */
@Component({
  selector: 'mifosx-view-merchant',
  templateUrl: './view-merchant.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ReactiveFormsModule,
    RouterLink,
    FaIconComponent,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatButton,
    MatFormField,
    MatLabel,
    MatInput,
    MatTabGroup,
    MatTab,
    QrisCodesTabComponent,
    QrisTransactionsTabComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewMerchantComponent {
  private route = inject(ActivatedRoute);
  private qrisService = inject(QrisService);
  private formBuilder = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  /** Merchant data from the resolver (undefined when the id is unknown). */
  merchantData: any;

  /** Sale form (amount only; idempotency key minted per submit). */
  saleForm: FormGroup = this.formBuilder.group({
    amount: [
      null,
      [
        Validators.required,
        Validators.min(1)
      ]
    ]
  });

  /** Reversal form (transaction id + optional partial amount). */
  reversalForm: FormGroup = this.formBuilder.group({
    transactionId: [
      null,
      Validators.required
    ],
    amount: [null]
  });

  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { merchant: any }) => {
      this.merchantData = data.merchant;
    });
  }

  /**
   * Books an MDR-rated sale, then reloads the merchant.
   */
  sell() {
    const payload = {
      idempotencyKey: crypto.randomUUID(),
      amount: this.saleForm.value.amount,
      currency: 'IDR'
    };
    this.qrisService
      .createSale(this.merchantData.id, payload)
      .pipe(take(1))
      .subscribe(() => {
        this.saleForm.reset({ amount: null });
        this.reload();
      });
  }

  /**
   * Voids a sale (full MDR unwind), then reloads.
   */
  voidSale() {
    const payload = { idempotencyKey: crypto.randomUUID() };
    this.qrisService
      .voidTransaction(this.reversalForm.value.transactionId, payload)
      .pipe(take(1))
      .subscribe(() => this.reload());
  }

  /**
   * Refunds a sale, full or partial (proportional MDR unwind), then reloads.
   */
  refund() {
    const payload = {
      idempotencyKey: crypto.randomUUID(),
      amount: this.reversalForm.value.amount
    };
    this.qrisService
      .refundTransaction(this.reversalForm.value.transactionId, payload)
      .pipe(take(1))
      .subscribe(() => this.reload());
  }

  /**
   * Issues a static code (supersedes the active one), then reloads.
   */
  issueCode() {
    this.qrisService
      .issueCode(this.merchantData.id)
      .pipe(take(1))
      .subscribe(() => this.reload());
  }

  private reload() {
    this.qrisService
      .getMerchant(this.merchantData.id)
      .pipe(take(1))
      .subscribe((merchant: any) => {
        this.merchantData = merchant;
        this.cdr.markForCheck();
      });
  }
}
