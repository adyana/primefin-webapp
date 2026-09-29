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
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Custom Services */
import { ChannelingService } from '../../channeling.service';

/**
 * Risk-band pricing tab (bps per mapped product).
 */
@Component({
  selector: 'mifosx-rates-tab',
  templateUrl: './rates-tab.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ReactiveFormsModule,
    MatButton,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
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
export class RatesTabComponent implements OnInit {
  private channelingService = inject(ChannelingService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  /** Owning partner id. */
  @Input() partnerId: number;

  /** Table columns. */
  displayedColumns: string[] = [
    'product',
    'band',
    'bps',
    'actions'
  ];
  /** Table data. */
  dataSource = new MatTableDataSource<any>([]);
  /** Partner mappings for the product selector and code lookup. */
  mappings: any[] = [];
  /** Create form. */
  bandForm: FormGroup;

  ngOnInit() {
    this.bandForm = this.formBuilder.group({
      partnerProductId: [
        '',
        Validators.required
      ],
      band: [
        '',
        Validators.required
      ],
      bps: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]+(\\.[0-9]+)?$')
        ]
      ]
    });
    this.refresh();
  }

  /**
   * Reloads mappings, then this partner's bands.
   */
  refresh() {
    this.channelingService
      .getProducts(this.partnerId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((mappings: any) => {
        this.mappings = mappings || [];
        const ids = new Set(this.mappings.map((mapping: any) => Number(mapping.id)));
        this.channelingService
          .getRateBands()
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((bands: any) => {
            this.dataSource.data = (bands || []).filter((band: any) => ids.has(Number(band.partnerProductId)));
          });
      });
  }

  /**
   * Resolves a mapping id to its partner product code.
   * @param mappingId Mapping id.
   */
  codeOf(mappingId: number): string {
    const mapping = this.mappings.find((entry: any) => Number(entry.id) === Number(mappingId));
    return mapping ? mapping.partnerProductCode : String(mappingId);
  }

  /**
   * Creates a rate band.
   */
  submit() {
    const raw = this.bandForm.getRawValue();
    this.channelingService
      .createRateBand({ partnerProductId: Number(raw.partnerProductId), band: raw.band, bps: Number(raw.bps) })
      .pipe(take(1))
      .subscribe(() => {
        this.bandForm.reset();
        this.refresh();
      });
  }

  /**
   * Deletes a rate band.
   * @param bandId Band id.
   */
  remove(bandId: number) {
    this.channelingService
      .deleteRateBand(bandId)
      .pipe(take(1))
      .subscribe(() => this.refresh());
  }
}
