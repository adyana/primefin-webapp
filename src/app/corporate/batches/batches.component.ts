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
 * Bulk disbursement batches: filter bar, create form with pasted CSV
 * items (account,name,amount[,reference,bank] per line), batch table
 * with submit/execute, and the selected batch's item table.
 */
@Component({
  selector: 'mifosx-corporate-batches',
  templateUrl: './batches.component.html',
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
export class CorporateBatchesComponent implements OnInit {
  private corporateService = inject(CorporateService);
  private batchService = inject(CorporateBatchService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  filtersForm: FormGroup = this.formBuilder.group({ status: ['ALL'] });
  createForm: FormGroup = this.formBuilder.group({
    corporateId: [
      null,
      Validators.required
    ],
    reference: [
      '',
      Validators.required
    ],
    rail: [
      'ICT',
      Validators.required
    ],
    itemsCsv: [
      '',
      Validators.required
    ]
  });

  corporates: any[] = [];
  batchesDataSource = new MatTableDataSource<any>([]);
  batchColumns: string[] = [
    'reference',
    'corporate',
    'rail',
    'total',
    'status',
    'actions'
  ];
  itemsDataSource = new MatTableDataSource<any>([]);
  itemColumns: string[] = [
    'line',
    'account',
    'name',
    'amount',
    'status',
    'reason'
  ];

  /** Selected batch for the item table (null = none selected). */
  selectedBatch: any = null;

  /** Paginators for the batch and item tables. */
  @ViewChild('batchesPaginator') batchesPaginator: MatPaginator;
  @ViewChild('itemsPaginator') itemsPaginator: MatPaginator;

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
    this.filtersForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.reload());
    this.reload();
  }

  create(): void {
    if (!this.createForm.valid) {
      return;
    }
    const value = this.createForm.value;
    this.batchService
      .createBatch({
        corporateId: value.corporateId,
        reference: value.reference,
        rail: value.rail,
        items: this.parseCsv(value.itemsCsv)
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.createForm.reset({ rail: 'ICT' });
        this.reload();
      });
  }

  submit(row: any): void {
    this.batchService
      .submitBatch(row.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  execute(row: any): void {
    this.batchService
      .executeBatch(row.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  selectBatch(row: any): void {
    this.selectedBatch = row;
    this.batchService
      .getItems(row.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of([]))
      )
      .subscribe((items: any) => {
        this.itemsDataSource.data = Array.isArray(items) ? items : [];
        if (this.itemsPaginator) {
          this.itemsDataSource.paginator = this.itemsPaginator;
        }
        this.cdr.markForCheck();
      });
  }

  /** Parses account,name,amount[,reference,bank] lines; blanks skipped. */
  parseCsv(text: string): any[] {
    const items: any[] = [];
    for (const line of (text || '').split('\n')) {
      const parts = line
        .split(',')
        .map((part: string) => part.trim())
        .filter((part: string) => part.length > 0);
      if (parts.length < 3) {
        continue;
      }
      items.push({
        creditorAccount: parts[0],
        creditorName: parts[1],
        amount: parts[2],
        reference: parts[3] ?? null,
        creditorBank: parts[4] ?? null
      });
    }
    return items;
  }

  private reload(): void {
    const status = this.filtersForm.value.status === 'ALL' ? undefined : this.filtersForm.value.status;
    this.batchService
      .getBatches(status)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of([]))
      )
      .subscribe((batches: any) => {
        this.batchesDataSource.data = Array.isArray(batches) ? batches : [];
        if (this.batchesPaginator) {
          this.batchesDataSource.paginator = this.batchesPaginator;
        }
        this.cdr.markForCheck();
      });
  }
}
