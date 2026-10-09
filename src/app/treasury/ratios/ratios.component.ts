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

/** rxjs Imports */
import { catchError, of } from 'rxjs';

/** Custom Services */
import { TreasuryRatiosService } from '../treasury-ratios.service';

/** Shared Page Standard */
import { PageToolbarComponent } from '../../shared/page-toolbar/page-toolbar.component';
import { StatusPillComponent } from '../../shared/status-pill/status-pill.component';

/**
 * Prudential ratios board: board-approved capital snapshots, limit
 * thresholds, CAR/exposure computation per SLIK period and KPMM/BMPK
 * filing with extract download.
 */
@Component({
  selector: 'mifosx-treasury-ratios',
  templateUrl: './ratios.component.html',
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
export class TreasuryRatiosComponent implements OnInit {
  private ratiosService = inject(TreasuryRatiosService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  capitalForm: FormGroup = this.formBuilder.group({
    period: [
      '',
      [
        Validators.required,
        Validators.pattern(/^\d{6}$/)
      ]
    ],
    modalInti: [
      null,
      [
        Validators.required,
        Validators.min(1)
      ]
    ]
  });
  lookupForm: FormGroup = this.formBuilder.group({ period: [
      '',
      [
        Validators.required,
        Validators.pattern(/^\d{6}$/)
      ]
    ] });

  capitalDataSource = new MatTableDataSource<any>([]);
  capitalColumns: string[] = [
    'period',
    'modalInti'
  ];
  limitDataSource = new MatTableDataSource<any>([]);
  limitColumns: string[] = [
    'code',
    'threshold',
    'severity'
  ];
  exposureDataSource = new MatTableDataSource<any>([]);
  exposureColumns: string[] = [
    'client',
    'exposure',
    'share',
    'breach'
  ];

  /** Latest computed ratios (null = nothing computed yet this session). */
  ratios: any = null;

  /** Live exposures count for the toolbar badge. */
  exposuresCount: number | null = null;

  /** Last filed submission ids (null = nothing filed yet this session). */
  kpmmFilingId: number | null = null;
  bmpkFilingId: number | null = null;

  /** Paginator for the exposures table. */
  @ViewChild('exposuresPaginator') exposuresPaginator: MatPaginator;

  ngOnInit(): void {
    this.reload();
  }

  recordCapital(): void {
    if (!this.capitalForm.valid) {
      return;
    }
    this.ratiosService
      .recordCapital(this.capitalForm.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.capitalForm.reset();
        this.reload();
      });
  }

  compute(): void {
    if (!this.lookupForm.valid) {
      return;
    }
    this.ratiosService
      .getRatios(this.lookupForm.value.period)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of(null))
      )
      .subscribe((ratios: any) => {
        this.ratios = ratios;
        this.exposureDataSource.data = ratios && Array.isArray(ratios.exposures) ? ratios.exposures : [];
        this.exposuresCount = this.exposureDataSource.data.length;
        if (this.exposuresPaginator) {
          this.exposureDataSource.paginator = this.exposuresPaginator;
        }
        this.cdr.markForCheck();
      });
  }

  filterExposures(text: string): void {
    this.exposureDataSource.filter = (text || '').trim().toLowerCase();
    if (this.exposuresPaginator) {
      this.exposureDataSource.paginator.firstPage();
    }
  }

  fileKpmm(): void {
    if (!this.lookupForm.valid) {
      return;
    }
    this.ratiosService
      .fileKpmm(this.lookupForm.value.period)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((filing: any) => {
        this.kpmmFilingId = filing.resourceId ?? filing.filingId ?? null;
        this.cdr.markForCheck();
      });
  }

  fileBmpk(): void {
    if (!this.lookupForm.valid) {
      return;
    }
    this.ratiosService
      .fileBmpk(this.lookupForm.value.period)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((filing: any) => {
        this.bmpkFilingId = filing.resourceId ?? filing.filingId ?? null;
        this.cdr.markForCheck();
      });
  }

  download(id: number | null): void {
    if (id === null) {
      return;
    }
    this.ratiosService.downloadFiling(id);
  }

  private reload(): void {
    this.ratiosService
      .getCapital()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of([]))
      )
      .subscribe((capital: any) => {
        this.capitalDataSource.data = Array.isArray(capital) ? capital : [];
        this.cdr.markForCheck();
      });
    this.ratiosService
      .getLimits()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of([]))
      )
      .subscribe((limits: any) => {
        this.limitDataSource.data = Array.isArray(limits) ? limits : [];
        this.cdr.markForCheck();
      });
  }
}
