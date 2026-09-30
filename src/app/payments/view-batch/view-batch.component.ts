/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Custom Services */
import { PaymentsService } from '../payments.service';

/**
 * Batch detail: members, DKE content, send action and returns filing.
 * Returns rows accumulate locally, then file in one call.
 */
@Component({
  selector: 'mifosx-payment-view-batch',
  templateUrl: './view-batch.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FormsModule,
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
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewPaymentBatchComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private paymentsService = inject(PaymentsService);
  private destroyRef = inject(DestroyRef);

  batch: any = null;
  membersDataSource = new MatTableDataSource<any>([]);
  memberColumns: string[] = ['key', 'debtor', 'creditor', 'amount', 'status'];
  dkeContent: string | null = null;
  returnRows: any[] = [];
  newRow = { ref: '', status: 'REJECTED', reason: '' };
  returnsResult: string | null = null;

  ngOnInit(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { batch: any }) => {
      this.batch = data.batch;
      this.loadMembers();
    });
  }

  loadMembers(): void {
    if (!this.batch) {
      return;
    }
    this.paymentsService
      .getBatchMembers(this.batch.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((members: any) => {
        this.membersDataSource.data = Array.isArray(members) ? members : [];
      });
  }

  loadDke(): void {
    this.paymentsService
      .getBatchDke(this.batch.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((dke: any) => {
        this.dkeContent = typeof dke === 'string' ? dke : JSON.stringify(dke);
      });
  }

  send(): void {
    this.paymentsService
      .sendBatch(this.batch.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadMembers());
  }

  addReturnRow(): void {
    if (!this.newRow.ref || !this.newRow.reason) {
      return;
    }
    this.returnRows = [...this.returnRows, { ...this.newRow }];
    this.newRow = { ref: '', status: 'REJECTED', reason: '' };
  }

  fileReturns(): void {
    if (this.returnRows.length === 0) {
      return;
    }
    this.paymentsService
      .fileBatchReturns(this.batch.id, this.returnRows)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.returnsResult = `${this.returnRows.length} return rows filed.`;
        this.returnRows = [];
        this.loadMembers();
      });
  }
}
