/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0.
 */
/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, OnInit, ViewChild, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
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
  MatRow,
  MatNoDataRow
} from '@angular/material/table';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { EkycReviewItem } from '../models/ekyc-review-item.model';

/**
 * e-KYC Review Queue Page Component.
 * Officer view of pending e-KYC sessions awaiting review.
 */
@Component({
  selector: 'mifosx-ekyc-review-queue-page',
  templateUrl: './queue-page.component.html',
  styleUrls: ['./queue-page.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatNoDataRow,
    MatPaginator,
    MatButton,
    MatIcon
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EkycReviewQueuePageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  /** Review queue data from resolve. */
  reviewItems: EkycReviewItem[] = [];
  /** Columns to be displayed. */
  displayedColumns: string[] = [
    'id',
    'nik',
    'status',
    'attemptsRemaining',
    'createdAt',
    'actions'
  ];
  /** Data source for the table. */
  dataSource: MatTableDataSource<EkycReviewItem>;

  /** Paginator. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { reviewQueue: EkycReviewItem[] }) => {
      this.reviewItems = data.reviewQueue ?? [];
      this.setQueue();
    });
  }

  ngOnInit() {
    this.setQueue();
  }

  setQueue() {
    this.dataSource = new MatTableDataSource(this.reviewItems);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Navigate to the review detail page for a specific item.
   * @param item Review queue item
   */
  openReview(item: EkycReviewItem): void {
    this.router.navigate([
      '/ekyc-review/review',
      item.id
    ]);
  }

  /**
   * Quick approve from the queue (inline action).
   * @param item Review queue item
   */
  quickApprove(item: EkycReviewItem): void {
    if (confirm(`Approve e-KYC session ${item.id} for NIK ${item.nik}?`)) {
      this.router.navigate(
        [
          '/ekyc-review/review',
          item.id
        ],
        {
          queryParams: { action: 'approve' }
        }
      );
    }
  }

  /**
   * Track by function for table rows.
   */
  trackById(_index: number, item: EkycReviewItem): string {
    return item.id;
  }
}
