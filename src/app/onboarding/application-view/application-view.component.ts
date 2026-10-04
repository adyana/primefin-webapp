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
import { ActivatedRoute } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell } from '@angular/material/table';
import { MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatButton } from '@angular/material/button';
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
    FaIconComponent,
    MatCard,
    MatCardTitle,
    MatCardContent,
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
