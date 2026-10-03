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
 * Credit-application pipeline board: open applications, walk stages,
 * score, disburse and book. Approval decisions live on the approvals
 * board (maker never equals checker).
 */
@Component({
  selector: 'mifosx-pipeline-board',
  templateUrl: './pipeline-board.component.html',
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
export class PipelineBoardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private onboardingService = inject(OnboardingService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  applicationsDataSource = new MatTableDataSource<any>([]);
  applicationColumns: string[] = [
    'id',
    'clientId',
    'principalAmount',
    'currentStage',
    'status',
    'score',
    'loanId',
    'actions'
  ];

  openForm: FormGroup = this.formBuilder.group({
    clientId: [
      '',
      [
        Validators.required,
        Validators.pattern('^[0-9]+$')
      ]
    ],
    productId: [
      '',
      [
        Validators.required,
        Validators.pattern('^[0-9]+$')
      ]
    ],
    principalAmount: [
      '',
      [
        Validators.required,
        Validators.pattern('^[0-9]+(\\.[0-9]+)?$')
      ]
    ]
  });

  ngOnInit(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { applications: any }) => {
      this.applicationsDataSource.data = Array.isArray(data.applications?.pageItems) ? data.applications.pageItems : [];
    });
  }

  open(): void {
    const v = this.openForm.value;
    this.onboardingService
      .createApplication({
        clientId: Number(v.clientId),
        productId: Number(v.productId),
        principalAmount: v.principalAmount,
        transactionId: `UI-${Date.now()}`,
        source: 'UI',
        sourceReference: 'pipeline-board'
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.openForm.reset({ clientId: '', productId: '', principalAmount: '' });
        this.reload();
      });
  }

  advance(id: number): void {
    this.onboardingService
      .advance(id, 'board advance')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  score(id: number): void {
    this.onboardingService
      .score(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  disburse(id: number): void {
    this.onboardingService
      .disburse(id, 'board disburse')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  book(id: number): void {
    this.onboardingService
      .book(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  private reload(): void {
    this.onboardingService
      .listApplications()
      .pipe(take(1))
      .subscribe((page: any) => {
        this.applicationsDataSource.data = Array.isArray(page?.pageItems) ? page.pageItems : [];
        this.cdr.markForCheck();
      });
  }
}
