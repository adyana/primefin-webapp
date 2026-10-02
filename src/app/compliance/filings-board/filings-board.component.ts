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
import { ComplianceService } from '../compliance.service';

/**
 * Filing catalog: file LBUT extracts into the shared submission log,
 * countersign with a second user, submit locked filings and download the
 * rendered bytes. Forward-only lifecycle, maker never equals checker.
 */
@Component({
  selector: 'mifosx-filings-board',
  templateUrl: './filings-board.component.html',
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
export class FilingsBoardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private complianceService = inject(ComplianceService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  filingsDataSource = new MatTableDataSource<any>([]);
  filingColumns: string[] = [
    'reportCode',
    'period',
    'builder',
    'rowCount',
    'checksum',
    'status',
    'actions'
  ];

  fileForm: FormGroup = this.formBuilder.group({
    period: [
      '',
      [
        Validators.required,
        Validators.pattern('^[0-9]{6}$')
      ]
    ]
  });

  ngOnInit(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { filings: any }) => {
      this.filingsDataSource.data = Array.isArray(data.filings) ? data.filings : [];
    });
  }

  fileKredit(): void {
    this.complianceService
      .fileLbutKredit(this.fileForm.value.period)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.fileForm.reset({ period: '' });
        this.reload();
      });
  }

  fileSimpanan(): void {
    this.complianceService
      .fileLbutSimpanan(this.fileForm.value.period)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.fileForm.reset({ period: '' });
        this.reload();
      });
  }

  countersign(id: number): void {
    this.complianceService
      .countersignFiling(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  submit(id: number): void {
    this.complianceService
      .submitFiling(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  download(id: number): void {
    this.complianceService.downloadLbutFiling(id);
  }

  private reload(): void {
    this.complianceService
      .getFilings()
      .pipe(take(1))
      .subscribe((filings: any) => {
        this.filingsDataSource.data = Array.isArray(filings) ? filings : [];
        this.cdr.markForCheck();
      });
  }
}
