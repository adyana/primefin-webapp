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
  Input,
  OnInit,
  inject,
  DestroyRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
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
import { catchError, of, take } from 'rxjs';

/** Custom Services */
import { QrisService } from '../../qris.service';

/**
 * Merchant transactions tab with type filter.
 */
@Component({
  selector: 'mifosx-qris-transactions-tab',
  templateUrl: './transactions-tab.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QrisTransactionsTabComponent implements OnInit {
  private qrisService = inject(QrisService);
  private formBuilder = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  /** Merchant id from the detail shell. */
  @Input() merchantId: number;

  filterForm: FormGroup = this.formBuilder.group({ type: ['ALL'] });

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [
    'reference',
    'type',
    'amount',
    'mdrAmount',
    'merchantNet',
    'status'
  ];

  ngOnInit() {
    this.load();
    this.filterForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.load());
  }

  private load() {
    const type = this.filterForm.value.type === 'ALL' ? undefined : this.filterForm.value.type;
    this.qrisService
      .getTransactions(this.merchantId, type)
      .pipe(
        take(1),
        catchError(() => of([]))
      )
      .subscribe((txns: any[]) => {
        this.dataSource.data = Array.isArray(txns) ? txns : [];
        this.cdr.markForCheck();
      });
  }
}
