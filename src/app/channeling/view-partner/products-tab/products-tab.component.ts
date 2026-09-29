/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, Input, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
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

/** Custom Services */
import { ChannelingService } from '../../channeling.service';

/**
 * Partner product mappings tab (partner code -> own product id).
 */
@Component({
  selector: 'mifosx-products-tab',
  templateUrl: './products-tab.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ReactiveFormsModule,
    MatButton,
    MatFormField,
    MatLabel,
    MatInput,
    FaIconComponent,
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
export class ProductsTabComponent implements OnInit {
  private channelingService = inject(ChannelingService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  /** Owning partner id. */
  @Input() partnerId: number;

  /** Table columns. */
  displayedColumns: string[] = [
    'partnerProductCode',
    'ourProductId',
    'actions'
  ];
  /** Table data. */
  dataSource = new MatTableDataSource<any>([]);
  /** Create form. */
  mappingForm: FormGroup;

  ngOnInit() {
    this.mappingForm = this.formBuilder.group({
      partnerProductCode: [
        '',
        Validators.required
      ],
      ourProductId: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]+$')
        ]
      ]
    });
    this.refresh();
  }

  /**
   * Reloads this partner's mappings.
   */
  refresh() {
    this.channelingService
      .getProducts(this.partnerId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((rows: any) => {
        this.dataSource.data = rows || [];
      });
  }

  /**
   * Creates a mapping for this partner.
   */
  submit() {
    const raw = this.mappingForm.getRawValue();
    this.channelingService
      .createProduct({
        partnerId: this.partnerId,
        partnerProductCode: raw.partnerProductCode,
        ourProductId: Number(raw.ourProductId)
      })
      .pipe(take(1))
      .subscribe(() => {
        this.mappingForm.reset();
        this.refresh();
      });
  }

  /**
   * Deletes a mapping (blocked server-side while rate bands remain).
   * @param mappingId Mapping id.
   */
  remove(mappingId: number) {
    this.channelingService
      .deleteProduct(mappingId)
      .pipe(take(1))
      .subscribe(() => this.refresh());
  }
}
