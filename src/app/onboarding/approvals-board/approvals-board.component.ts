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
import { ActivatedRoute } from '@angular/router';
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

/** rxjs Imports */
import { take } from 'rxjs';

/** Custom Services */
import { OnboardingService } from '../onboarding.service';

/**
 * Approval queue: applications waiting at the APPROVAL stage with their
 * recorded scores. Approve and reject both require a reason; the backend
 * enforces tier permission and maker-not-equal-checker.
 */
@Component({
  selector: 'mifosx-approvals-board',
  templateUrl: './approvals-board.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ReactiveFormsModule,
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
export class ApprovalsBoardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private onboardingService = inject(OnboardingService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  queueDataSource = new MatTableDataSource<any>([]);
  queueColumns: string[] = [
    'id',
    'clientId',
    'principalAmount',
    'score',
    'actions'
  ];

  decideForm: FormGroup = this.formBuilder.group({
    reason: [
      '',
      [
        Validators.required,
        Validators.minLength(3)
      ]
    ]
  });

  ngOnInit(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { queue: any }) => {
      this.queueDataSource.data = Array.isArray(data.queue?.pageItems) ? data.queue.pageItems : [];
    });
  }

  approve(id: number): void {
    if (!this.decideForm.valid) {
      return;
    }
    this.onboardingService
      .approve(id, this.decideForm.value.reason)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  reject(id: number): void {
    if (!this.decideForm.valid) {
      return;
    }
    this.onboardingService
      .reject(id, this.decideForm.value.reason)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  private reload(): void {
    this.onboardingService
      .listApplications('APPROVAL')
      .pipe(take(1))
      .subscribe((page: any) => {
        this.queueDataSource.data = Array.isArray(page?.pageItems) ? page.pageItems : [];
        this.cdr.markForCheck();
      });
  }
}
