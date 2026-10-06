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
import { ActivatedRoute } from '@angular/router';
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
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** rxjs Imports */
import { catchError, of, take } from 'rxjs';

/** Custom Services */
import { ComplianceService } from '../compliance.service';

/**
 * SLIK period board: close month-end snapshots, browse frozen rows, tie
 * totals back to the ledger, submit locked periods and download the
 * IDI-layout extract. Snapshots are immutable — history is never edited.
 */
@Component({
  selector: 'mifosx-slik-board',
  templateUrl: './slik-board.component.html',
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
    MatButton,
    MatPaginator
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlikBoardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private complianceService = inject(ComplianceService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  snapshotsDataSource = new MatTableDataSource<any>([]);
  snapshotColumns: string[] = [
    'period',
    'status',
    'actions'
  ];

  rowsDataSource = new MatTableDataSource<any>([]);
  rowColumns: string[] = [
    'source',
    'loanId',
    'productCode',
    'outstanding',
    'collectibility',
    'dpdDays'
  ];

  closeForm: FormGroup = this.formBuilder.group({
    period: [
      '',
      [
        Validators.required,
        Validators.pattern('^[0-9]{6}$')
      ]
    ]
  });

  /** Period selected for row browsing (null = none selected). */
  selectedPeriod: string | null = null;
  /** Latest tie-out result for the selected period. */
  tieOut: any = null;

  /** Paginator for the period rows table (hundreds of loans per period). */
  @ViewChild(MatPaginator) rowsPaginator: MatPaginator;

  ngOnInit(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { snapshots: any }) => {
      this.snapshotsDataSource.data = Array.isArray(data.snapshots) ? data.snapshots : [];
    });
  }

  closePeriod(): void {
    this.complianceService
      .closeSlikPeriod(this.closeForm.value.period)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.closeForm.reset({ period: '' });
        this.reload();
      });
  }

  selectPeriod(period: string): void {
    this.selectedPeriod = period;
    this.tieOut = null;
    this.complianceService
      .getSlikRows(period)
      .pipe(
        take(1),
        catchError(() => of([]))
      )
      .subscribe((rows: any) => {
        this.rowsDataSource.data = Array.isArray(rows) ? rows : [];
        if (this.rowsPaginator) {
          this.rowsDataSource.paginator = this.rowsPaginator;
        }
        this.cdr.markForCheck();
      });
  }

  validate(): void {
    if (!this.selectedPeriod) {
      return;
    }
    this.complianceService
      .validateSlikPeriod(this.selectedPeriod)
      .pipe(take(1))
      .subscribe((result: any) => {
        this.tieOut = result;
        this.cdr.markForCheck();
      });
  }

  submit(): void {
    if (!this.selectedPeriod) {
      return;
    }
    this.complianceService
      .submitSlikPeriod(this.selectedPeriod)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  download(): void {
    if (!this.selectedPeriod) {
      return;
    }
    this.complianceService.downloadSlikExtract(this.selectedPeriod);
  }

  private reload(): void {
    this.complianceService
      .getSlikSnapshots()
      .pipe(
        take(1),
        catchError(() => of([]))
      )
      .subscribe((snapshots: any) => {
        this.snapshotsDataSource.data = Array.isArray(snapshots) ? snapshots : [];
        this.cdr.markForCheck();
      });
  }
}
