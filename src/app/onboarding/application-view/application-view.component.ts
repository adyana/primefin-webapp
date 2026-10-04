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
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell } from '@angular/material/table';
import { MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatButton } from '@angular/material/button';
import { switchMap, of } from 'rxjs';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Custom Services */
import { OnboardingService } from '../onboarding.service';

/**
 * Application detail: header facts plus the full stage timeline with
 * actors, reasons and completion dates. Actions mirror the pipeline
 * board for the open case.
 */
@Component({
  selector: 'mifosx-application-view',
  templateUrl: './application-view.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ReactiveFormsModule,
    FaIconComponent,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
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
export class ApplicationViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private onboardingService = inject(OnboardingService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  applicationId: number | null = null;
  currentStage: string | null = null;
  stagesDataSource = new MatTableDataSource<any>([]);
  stageColumns: string[] = [
    'stage',
    'status',
    'actor',
    'completedOn',
    'reason'
  ];

  ngOnInit(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { board: any }) => {
      this.applyBoard(data.board);
    });
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.reload());
    this.onboardingService
      .getChannelPartners()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((partners: any) => {
        this.partners = Array.isArray(partners) ? partners : [];
        this.cdr.markForCheck();
      });
  }

  advance(): void {
    if (this.applicationId == null) {
      return;
    }
    this.onboardingService
      .advance(this.applicationId, 'detail advance')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  bookForm: FormGroup = this.formBuilder.group({
    partnerCode: ['']
  });

  partners: any[] = [];

  book(): void {
    if (this.applicationId == null) {
      return;
    }
    const partner = this.bookForm.value.partnerCode || null;
    this.onboardingService
      .book(this.applicationId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((result: any) => {
          if (partner && result?.loanId) {
            return this.onboardingService.attributeMoney('LOAN', result.loanId, partner);
          }
          return of(null);
        })
      )
      .subscribe(() => this.reload());
  }

  private reload(): void {
    const id = Number(this.route.snapshot.params['id']);
    if (!id) {
      return;
    }
    this.applicationId = id;
    this.onboardingService.getBoard(id).subscribe((board: any) => {
      this.applyBoard(board);
      this.cdr.markForCheck();
    });
  }

  private applyBoard(board: any): void {
    if (!board) {
      return;
    }
    this.applicationId = board.applicationId ?? this.applicationId;
    this.currentStage = board.currentStage ?? null;
    this.stagesDataSource.data = Array.isArray(board.stages) ? board.stages : [];
  }
}
