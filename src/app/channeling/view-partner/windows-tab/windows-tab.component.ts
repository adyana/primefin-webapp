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
 * Processing windows tab (per stream, HH:MM).
 */
@Component({
  selector: 'mifosx-windows-tab',
  templateUrl: './windows-tab.component.html',
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
export class WindowsTabComponent implements OnInit {
  private channelingService = inject(ChannelingService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  /** Owning partner id. */
  @Input() partnerId: number;

  /** Table columns. */
  displayedColumns: string[] = [
    'stream',
    'startTime',
    'endTime',
    'actions'
  ];
  /** Table data. */
  dataSource = new MatTableDataSource<any>([]);
  /** Create form. */
  windowForm: FormGroup;

  ngOnInit() {
    this.windowForm = this.formBuilder.group({
      stream: [
        'DISB',
        Validators.required
      ],
      startTime: [
        '',
        Validators.required
      ],
      endTime: [
        '',
        Validators.required
      ]
    });
    this.refresh();
  }

  /**
   * Reloads this partner's windows.
   */
  refresh() {
    this.channelingService
      .getWindows(this.partnerId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((rows: any) => {
        this.dataSource.data = rows || [];
      });
  }

  /**
   * Creates a window for this partner.
   */
  submit() {
    const raw = this.windowForm.getRawValue();
    this.channelingService
      .createWindow({ partnerId: this.partnerId, stream: raw.stream, startTime: raw.startTime, endTime: raw.endTime })
      .pipe(take(1))
      .subscribe(() => {
        this.windowForm.reset({ stream: 'DISB' });
        this.refresh();
      });
  }

  /**
   * Deletes a window.
   * @param windowId Window id.
   */
  remove(windowId: number) {
    this.channelingService
      .deleteWindow(windowId)
      .pipe(take(1))
      .subscribe(() => this.refresh());
  }
}
