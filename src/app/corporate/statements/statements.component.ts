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
import { CorporateService } from '../corporate.service';
import { CorporateBatchService } from '../corporate-batch.service';

/**
 * Corporate statements: corporate + date range picker, balance header,
 * line table and MT940 / camt.053 downloads.
 */
@Component({
  selector: 'mifosx-corporate-statements',
  templateUrl: './statements.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
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
export class CorporateStatementsComponent implements OnInit {
  private corporateService = inject(CorporateService);
  private batchService = inject(CorporateBatchService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  paramsForm: FormGroup = this.formBuilder.group({
    corporateId: [
      null,
      Validators.required
    ],
    from: [
      '',
      Validators.required
    ],
    to: [
      '',
      Validators.required
    ]
  });

  corporates: any[] = [];
  statement: any = null;
  linesDataSource = new MatTableDataSource<any>([]);
  lineColumns: string[] = [
    'date',
    'direction',
    'amount',
    'reference'
  ];

  /** Paginator for the statement lines table. */
  @ViewChild(MatPaginator) linesPaginator: MatPaginator;

  ngOnInit(): void {
    this.corporateService
      .getCorporates('ACTIVE')
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of([]))
      )
      .subscribe((corporates: any) => {
        this.corporates = Array.isArray(corporates) ? corporates : [];
        this.cdr.markForCheck();
      });
  }

  preview(): void {
    if (!this.paramsForm.valid) {
      return;
    }
    const value = this.paramsForm.value;
    this.batchService
      .getStatement(value.corporateId, value.from, value.to)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of(null))
      )
      .subscribe((statement: any) => {
        this.statement = statement;
        this.linesDataSource.data = statement && Array.isArray(statement.entries) ? statement.entries : [];
        if (this.linesPaginator) {
          this.linesDataSource.paginator = this.linesPaginator;
        }
        this.cdr.markForCheck();
      });
  }

  download(format: 'mt940' | 'camt053'): void {
    if (!this.paramsForm.valid) {
      return;
    }
    const value = this.paramsForm.value;
    this.batchService.downloadStatement(value.corporateId, value.from, value.to, format);
  }
}
