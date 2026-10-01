/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import {
  MatTableDataSource,
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Custom Services */
import { PaymentsService } from '../payments.service';

/**
 * Collection requests board: every request with approve/reject review.
 * Stale PENDING requests expire via the EXPIRE_COLLECTION schedule.
 */
@Component({
  selector: 'mifosx-payment-collections',
  templateUrl: './collections.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ReactiveFormsModule,
    RouterLink,
    FaIconComponent,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatButton
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentCollectionsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private paymentsService = inject(PaymentsService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  collectionsDataSource = new MatTableDataSource<any>([]);
  collectionColumns: string[] = [
    'reference',
    'creditorAccount',
    'debtorAccount',
    'amount',
    'status',
    'expiresOn',
    'actions'
  ];

  /** Row selected for review (null = no review form). */
  selectedRequest: any = null;
  reviewForm: FormGroup = this.formBuilder.group({
    externalRef: [
      '',
      Validators.required
    ]
  });

  ngOnInit(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { collections: any }) => {
      this.collectionsDataSource.data = Array.isArray(data.collections) ? data.collections : [];
    });
  }

  selectForReview(requestRow: any): void {
    this.selectedRequest = requestRow;
    this.reviewForm.reset({ externalRef: requestRow.reference });
    this.cdr.markForCheck();
  }

  approve(): void {
    this.paymentsService
      .approveCollection(this.selectedRequest.id, this.reviewForm.value.externalRef)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.selectedRequest = null;
        this.reload();
      });
  }

  reject(): void {
    this.paymentsService
      .rejectCollection(this.selectedRequest.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.selectedRequest = null;
        this.reload();
      });
  }

  private reload(): void {
    this.paymentsService
      .getCollections()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((collections: any) => {
        this.collectionsDataSource.data = Array.isArray(collections) ? collections : [];
        this.cdr.markForCheck();
      });
  }
}
