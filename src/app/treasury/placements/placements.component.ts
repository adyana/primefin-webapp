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
import { MatSelect, MatOption } from '@angular/material/select';
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

/** rxjs Imports */
import { catchError, of } from 'rxjs';

/** Custom Services */
import { TreasuryService } from '../treasury.service';

/** Shared Page Standard */
import { PageToolbarComponent } from '../../shared/page-toolbar/page-toolbar.component';
import { StatusPillComponent } from '../../shared/status-pill/status-pill.component';

/**
 * Money-market placement board: filter by status, book placements,
 * accrue interest and mature with finalized interest.
 */
@Component({
  selector: 'mifosx-treasury-placements',
  templateUrl: './placements.component.html',
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
    MatSelect,
    MatOption,
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
export class TreasuryPlacementsComponent implements OnInit {
  private treasuryService = inject(TreasuryService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  filtersForm: FormGroup = this.formBuilder.group({ status: ['ALL'] });
  placeForm: FormGroup = this.formBuilder.group({
    counterpartyBank: [
      '',
      Validators.required
    ],
    currency: ['IDR'],
    amount: [
      null,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],
    rateBps: [
      null,
      [
        Validators.required,
        Validators.min(0)
      ]
    ],
    valueDate: [
      '',
      Validators.required
    ],
    maturityDate: [
      '',
      Validators.required
    ]
  });

  placementsDataSource = new MatTableDataSource<any>([]);
  placementColumns: string[] = [
    'counterparty',
    'amount',
    'rate',
    'valueDate',
    'maturityDate',
    'accrued',
    'status',
    'actions'
  ];

  /** Paginator for the placements table. */
  @ViewChild(MatPaginator) placementsPaginator: MatPaginator;

  /** Live placement count for the toolbar badge. */
  placementCount: number | null = null;

  ngOnInit(): void {
    this.filtersForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.reload());
    this.reload();
  }

  place(): void {
    if (!this.placeForm.valid) {
      return;
    }
    this.treasuryService
      .placePlacement(this.placeForm.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.placeForm.reset({ currency: 'IDR' });
        this.reload();
      });
  }

  accrue(row: any): void {
    this.treasuryService
      .accruePlacement(row.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  mature(row: any): void {
    this.treasuryService
      .maturePlacement(row.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  private reload(): void {
    const status = this.filtersForm.value.status === 'ALL' ? undefined : this.filtersForm.value.status;
    this.treasuryService
      .getPlacements(status)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of([]))
      )
      .subscribe((placements: any) => {
        this.placementsDataSource.data = Array.isArray(placements) ? placements : [];
        this.placementCount = this.placementsDataSource.data.length;
        if (this.placementsPaginator) {
          this.placementsDataSource.paginator = this.placementsPaginator;
        }
        this.cdr.markForCheck();
      });
  }

  applySearch(text: string): void {
    this.placementsDataSource.filter = (text || '').trim().toLowerCase();
    if (this.placementsDataSource.paginator) {
      this.placementsDataSource.paginator.firstPage();
    }
  }
}
