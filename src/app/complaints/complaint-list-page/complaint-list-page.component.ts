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

/**
 * Complaint List Page Component.
 * Customer-facing complaint list with optional status filter.
 */
@Component({
  selector: 'mifosx-complaint-list-page',
  templateUrl: './complaint-list-page.component.html',
  styleUrls: ['./complaint-list-page.component.scss'],
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
export class ComplaintListPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  /** Complaint data from resolve. */
  complaints: any[] = [];
  /** Columns to be displayed. */
  displayedColumns: string[] = [
    'id',
    'complaintType',
    'subject',
    'status',
    'priority',
    'slaDeadline',
    'actions'
  ];
  /** Data source for the table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /** Status filter options. */
  statusFilter: string | null = null;

  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { complaints: any[] }) => {
      this.complaints = data.complaints ?? [];
      this.setComplaints();
    });
  }

  ngOnInit() {
    this.setComplaints();
  }

  setComplaints() {
    let filtered = this.complaints;
    if (this.statusFilter) {
      filtered = this.complaints.filter((c) => c.status === this.statusFilter);
    }
    this.dataSource = new MatTableDataSource(filtered);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Filter complaints by status.
   * @param status Status value or null for all
   */
  filterByStatus(status: string | null) {
    this.statusFilter = status;
    this.setComplaints();
  }

  /**
   * Navigate to complaint detail.
   * @param complaint Complaint object
   */
  viewComplaint(complaint: any): void {
    this.router.navigate([
      '/complaints',
      complaint.id
    ]);
  }

  /**
   * Track by function for table rows.
   */
  trackById(_index: number, item: any): number {
    return item.id;
  }

  /**
   * Get status display class.
   * @param status Complaint status
   */
  statusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }
}
