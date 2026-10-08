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
import { TreasuryNostroService } from '../treasury-nostro.service';

/**
 * Nostro auto-match: MT940 paste/import, statement list with line
 * drill-down, manual sweep and the exception-only breaks table.
 */
@Component({
  selector: 'mifosx-treasury-nostro',
  templateUrl: './nostro.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
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
export class TreasuryNostroComponent implements OnInit {
  private nostroService = inject(TreasuryNostroService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  importForm: FormGroup = this.formBuilder.group({ mt940: [
      '',
      Validators.required
    ] });

  statementsDataSource = new MatTableDataSource<any>([]);
  statementColumns: string[] = [
    'reference',
    'account',
    'source'
  ];
  linesDataSource = new MatTableDataSource<any>([]);
  lineColumns: string[] = [
    'date',
    'direction',
    'amount',
    'reference',
    'status'
  ];
  breaksDataSource = new MatTableDataSource<any>([]);
  breakColumns: string[] = [
    'reason',
    'status'
  ];

  /** Selected statement for the lines table (null = none selected). */
  selectedStatement: any = null;
  /** Last import/sweep counts (null = no run yet this session). */
  lastRun: any = null;

  /** Paginators for the statements, lines and breaks tables. */
  @ViewChild('statementsPaginator') statementsPaginator: MatPaginator;
  @ViewChild('linesPaginator') linesPaginator: MatPaginator;
  @ViewChild('breaksPaginator') breaksPaginator: MatPaginator;

  ngOnInit(): void {
    this.reload();
  }

  import(): void {
    if (!this.importForm.valid) {
      return;
    }
    this.nostroService
      .importStatement(this.importForm.value.mt940)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: any) => {
        this.lastRun = result;
        this.importForm.reset();
        this.reload();
      });
  }

  sweep(): void {
    this.nostroService
      .sweepMatch()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: any) => {
        this.lastRun = result;
        this.reload();
      });
  }

  selectStatement(row: any): void {
    this.selectedStatement = row;
    this.nostroService
      .getLines(row.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of([]))
      )
      .subscribe((lines: any) => {
        this.linesDataSource.data = Array.isArray(lines) ? lines : [];
        if (this.linesPaginator) {
          this.linesDataSource.paginator = this.linesPaginator;
        }
        this.cdr.markForCheck();
      });
  }

  private reload(): void {
    this.nostroService
      .getStatements()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of([]))
      )
      .subscribe((statements: any) => {
        this.statementsDataSource.data = Array.isArray(statements) ? statements : [];
        if (this.statementsPaginator) {
          this.statementsDataSource.paginator = this.statementsPaginator;
        }
        this.cdr.markForCheck();
      });
    this.nostroService
      .getNostroBreaks()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of([]))
      )
      .subscribe((breaks: any) => {
        this.breaksDataSource.data = Array.isArray(breaks) ? breaks : [];
        if (this.breaksPaginator) {
          this.breaksDataSource.paginator = this.breaksPaginator;
        }
        this.cdr.markForCheck();
      });
  }
}
