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
 * Amount caps tab (GLOBAL caps plus this partner's caps; caps carry no stream).
 */
@Component({
  selector: 'mifosx-caps-tab',
  templateUrl: './caps-tab.component.html',
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
export class CapsTabComponent implements OnInit {
  private channelingService = inject(ChannelingService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  /** Owning partner id. */
  @Input() partnerId: number;

  /** Table columns. */
  displayedColumns: string[] = [
    'scope',
    'maxAmount',
    'actions'
  ];
  /** Table data. */
  dataSource = new MatTableDataSource<any>([]);
  /** Create form. */
  capForm: FormGroup;

  ngOnInit() {
    this.capForm = this.formBuilder.group({
      scope: [
        'PARTNER',
        Validators.required
      ],
      maxAmount: [
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
   * Reloads global caps plus this partner's caps.
   */
  refresh() {
    this.channelingService
      .getCaps()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((caps: any) => {
        this.dataSource.data = (caps || []).filter(
          (cap: any) => cap.scope === 'GLOBAL' || Number(cap.partnerId) === Number(this.partnerId)
        );
      });
  }

  /**
   * Creates a cap (partner id is attached automatically for PARTNER scope).
   */
  submit() {
    const raw = this.capForm.getRawValue();
    const payload: any = { scope: raw.scope, maxAmount: Number(raw.maxAmount) };
    if (raw.scope === 'PARTNER') {
      payload.partnerId = this.partnerId;
    }
    this.channelingService
      .createCap(payload)
      .pipe(take(1))
      .subscribe(() => {
        this.capForm.reset({ scope: 'PARTNER' });
        this.refresh();
      });
  }

  /**
   * Deletes a cap.
   * @param capId Cap id.
   */
  remove(capId: number) {
    this.channelingService
      .deleteCap(capId)
      .pipe(take(1))
      .subscribe(() => this.refresh());
  }
}
