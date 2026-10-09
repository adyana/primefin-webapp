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

/**
 * FX rates board: manual publish, JISDOR-style CSV import and the
 * nostro revaluation table (positions per currency in IDR).
 */
@Component({
  selector: 'mifosx-treasury-fx',
  templateUrl: './fx.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    PageToolbarComponent,
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
export class TreasuryFxComponent implements OnInit {
  private treasuryService = inject(TreasuryService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  publishForm: FormGroup = this.formBuilder.group({
    pair: [
      '',
      Validators.required
    ],
    rate: [
      null,
      [
        Validators.required,
        Validators.min(0)
      ]
    ],
    source: [
      'MANUAL',
      Validators.required
    ],
    effectiveDate: [
      '',
      Validators.required
    ]
  });
  importForm: FormGroup = this.formBuilder.group({ csv: [
      '',
      Validators.required
    ] });

  ratesDataSource = new MatTableDataSource<any>([]);
  rateColumns: string[] = [
    'pair',
    'rate',
    'source',
    'date'
  ];
  positionsDataSource = new MatTableDataSource<any>([]);
  positionColumns: string[] = [
    'currency',
    'net',
    'rate',
    'netIdr'
  ];

  /** Last import counts (null = no import yet this session). */
  importResult: any = null;

  /** Live table counts for the toolbar badges. */
  ratesCount: number | null = null;
  positionsCount: number | null = null;

  /** Paginators for the rates and revaluation tables. */
  @ViewChild('ratesPaginator') ratesPaginator: MatPaginator;
  @ViewChild('positionsPaginator') positionsPaginator: MatPaginator;

  ngOnInit(): void {
    this.reload();
  }

  publish(): void {
    if (!this.publishForm.valid) {
      return;
    }
    this.treasuryService
      .publishFxRate(this.publishForm.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.publishForm.reset({ source: 'MANUAL' });
        this.reload();
      });
  }

  import(): void {
    if (!this.importForm.valid) {
      return;
    }
    this.treasuryService
      .importFxRates(this.importForm.value.csv)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: any) => {
        this.importResult = result;
        this.importForm.reset();
        this.reload();
      });
  }

  revalue(): void {
    this.treasuryService
      .getRevaluation()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of([]))
      )
      .subscribe((positions: any) => {
        this.positionsDataSource.data = Array.isArray(positions) ? positions : [];
        this.positionsCount = this.positionsDataSource.data.length;
        if (this.positionsPaginator) {
          this.positionsDataSource.paginator = this.positionsPaginator;
        }
        this.cdr.markForCheck();
      });
  }

  filterRates(text: string): void {
    this.ratesDataSource.filter = (text || '').trim().toLowerCase();
    if (this.ratesPaginator) {
      this.ratesDataSource.paginator.firstPage();
    }
  }

  filterPositions(text: string): void {
    this.positionsDataSource.filter = (text || '').trim().toLowerCase();
    if (this.positionsPaginator) {
      this.positionsDataSource.paginator.firstPage();
    }
  }

  private reload(): void {
    this.treasuryService
      .getFxRates()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of([]))
      )
      .subscribe((rates: any) => {
        this.ratesDataSource.data = Array.isArray(rates) ? rates : [];
        this.ratesCount = this.ratesDataSource.data.length;
        if (this.ratesPaginator) {
          this.ratesDataSource.paginator = this.ratesPaginator;
        }
        this.cdr.markForCheck();
      });
    this.revalue();
  }
}
