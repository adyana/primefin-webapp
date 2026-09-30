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
import { ActivatedRoute, RouterLink } from '@angular/router';
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

/** Custom Services */
import { PaymentsService } from '../payments.service';

/**
 * Transfer batches monitor: every payroll/bulk batch with status.
 * Detail page carries members, DKE, send and returns filing.
 */
@Component({
  selector: 'mifosx-payment-batches',
  templateUrl: './batches.component.html',
  imports: [...STANDALONE_SHARED_IMPORTS, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentBatchesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private paymentsService = inject(PaymentsService);
  private destroyRef = inject(DestroyRef);

  batchesDataSource = new MatTableDataSource<any>([]);
  batchColumns: string[] = ['reference', 'rail', 'layanan', 'status', 'valueDate'];

  ngOnInit(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { batches: any }) => {
      this.batchesDataSource.data = Array.isArray(data.batches) ? data.batches : [];
    });
  }
}
