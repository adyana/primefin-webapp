/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  inject,
  DestroyRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatPaginator } from '@angular/material/paginator';
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
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Shared Page Standard */
import { PageToolbarComponent } from '../../shared/page-toolbar/page-toolbar.component';
import { StatusPillComponent } from '../../shared/status-pill/status-pill.component';

/** rxjs Imports */
import { catchError, of } from 'rxjs';

/** Custom Services */
import { CorporateBatchService } from '../corporate-batch.service';

/**
 * Tiered approvals: SUBMITTED queue with approve/reject plus the
 * amount-tier matrix config (below every tier auto-passes, above all
 * bounded tiers fails closed).
 */
@Component({
  selector: 'mifosx-corporate-approvals',
  templateUrl: './approvals.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    PageToolbarComponent,
    StatusPillComponent,
    ReactiveFormsModule,
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
    MatButton,
    MatPaginator
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CorporateApprovalsComponent implements OnInit {
  private batchService = inject(CorporateBatchService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  tierForm: FormGroup = this.formBuilder.group({
    minAmount: [
      null,
      Validators.required
    ],
    maxAmount: [null],
    requiredPermission: [
      '',
      Validators.required
    ]
  });

  queueDataSource = new MatTableDataSource<any>([]);
  queueColumns: string[] = [
    'reference',
    'corporate',
    'total',
    'status',
    'actions'
  ];
  tiersDataSource = new MatTableDataSource<any>([]);
  tierColumns: string[] = [
    'min',
    'max',
    'permission'
  ];

  /** Live approval-queue count for the toolbar badge. */
  queueCount: number | null = null;

  /** Paginators for the queue and tier tables. */
  @ViewChild('queuePaginator') queuePaginator: MatPaginator;
  @ViewChild('tiersPaginator') tiersPaginator: MatPaginator;

  ngOnInit(): void {
    this.reload();
  }

  filterQueue(text: string): void {
    this.queueDataSource.filter = (text || '').trim().toLowerCase();
    if (this.queuePaginator) {
      this.queueDataSource.paginator.firstPage();
    }
  }

  createTier(): void {
    if (!this.tierForm.valid) {
      return;
    }
    this.batchService
      .createTier(this.tierForm.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.tierForm.reset();
        this.reload();
      });
  }

  approve(row: any): void {
    this.batchService
      .approveBatch(row.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  reject(row: any): void {
    this.batchService
      .rejectBatch(row.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  private reload(): void {
    this.batchService
      .getBatches('SUBMITTED')
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of([]))
      )
      .subscribe((batches: any) => {
        this.queueDataSource.data = Array.isArray(batches) ? batches : [];
        this.queueCount = this.queueDataSource.data.length;
        if (this.queuePaginator) {
          this.queueDataSource.paginator = this.queuePaginator;
        }
        this.cdr.markForCheck();
      });
    this.batchService
      .getTiers()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of([]))
      )
      .subscribe((tiers: any) => {
        this.tiersDataSource.data = Array.isArray(tiers) ? tiers : [];
        if (this.tiersPaginator) {
          this.tiersDataSource.paginator = this.tiersPaginator;
        }
        this.cdr.markForCheck();
      });
  }
}
