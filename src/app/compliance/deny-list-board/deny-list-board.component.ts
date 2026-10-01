/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatButton } from '@angular/material/button';
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
import { ComplianceService } from '../compliance.service';

/**
 * Deny-list board: lists with entries, CSV import, hit audit and the
 * false-positive allow-list. One board because ops works all five in one
 * sitting when triaging a hit.
 */
@Component({
  selector: 'mifosx-deny-list-board',
  templateUrl: './deny-list-board.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ReactiveFormsModule,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
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
    MatRow,
    MatButton
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DenyListBoardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private complianceService = inject(ComplianceService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  listsDataSource = new MatTableDataSource<any>([]);
  listColumns: string[] = [
    'code',
    'source',
    'description'
  ];

  entriesDataSource = new MatTableDataSource<any>([]);
  entryColumns: string[] = [
    'subjectType',
    'normValue',
    'reason',
    'actions'
  ];

  hitsDataSource = new MatTableDataSource<any>([]);
  hitColumns: string[] = [
    'context',
    'rawValue',
    'createdOn'
  ];

  allowDataSource = new MatTableDataSource<any>([]);
  allowColumns: string[] = [
    'subjectType',
    'normValue',
    'reason',
    'actions'
  ];

  /** List selected for entries/import (null = none selected). */
  selectedList: any = null;

  entryForm: FormGroup = this.formBuilder.group({
    subjectType: [
      'NAME',
      Validators.required
    ],
    value: [
      '',
      Validators.required
    ],
    reason: [
      '',
      Validators.required
    ]
  });

  importForm: FormGroup = this.formBuilder.group({
    content: [
      '',
      Validators.required
    ]
  });

  allowForm: FormGroup = this.formBuilder.group({
    subjectType: [
      'NAME',
      Validators.required
    ],
    value: [
      '',
      Validators.required
    ],
    reason: [
      '',
      Validators.required
    ]
  });

  subjectTypes: string[] = [
    'NAME',
    'ACCOUNT',
    'PHONE',
    'NATIONAL_ID',
    'CODE'
  ];

  ngOnInit(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { lists: any }) => {
      this.listsDataSource.data = Array.isArray(data.lists) ? data.lists : [];
    });
    this.reloadHits();
    this.reloadAllow();
  }

  selectList(listRow: any): void {
    this.selectedList = listRow;
    this.reloadEntries();
  }

  addEntry(): void {
    const raw = this.entryForm.getRawValue();
    this.complianceService
      .createEntry(this.selectedList.id, raw)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.entryForm.reset({ subjectType: 'NAME', value: '', reason: '' });
        this.reloadEntries();
      });
  }

  deleteEntry(entryRow: any): void {
    this.complianceService
      .deleteEntry(entryRow.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reloadEntries());
  }

  importCsv(): void {
    this.complianceService
      .importRows(this.selectedList.id, { format: 'CSV', content: this.importForm.value.content })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.importForm.reset({ content: '' });
        this.reloadEntries();
      });
  }

  release(): void {
    const raw = this.allowForm.getRawValue();
    this.complianceService
      .createAllow(raw)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.allowForm.reset({ subjectType: 'NAME', value: '', reason: '' });
        this.reloadAllow();
      });
  }

  revokeAllow(allowRow: any): void {
    this.complianceService
      .deleteAllow(allowRow.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reloadAllow());
  }

  private reloadEntries(): void {
    if (!this.selectedList) {
      return;
    }
    this.complianceService
      .getEntries(this.selectedList.id)
      .pipe(
        take(1),
        catchError(() => of([]))
      )
      .subscribe((entries: any) => {
        this.entriesDataSource.data = Array.isArray(entries) ? entries : [];
        this.cdr.markForCheck();
      });
  }

  private reloadHits(): void {
    this.complianceService
      .getHits()
      .pipe(
        take(1),
        catchError(() => of([]))
      )
      .subscribe((hits: any) => {
        this.hitsDataSource.data = Array.isArray(hits) ? hits : [];
        this.cdr.markForCheck();
      });
  }

  private reloadAllow(): void {
    this.complianceService
      .getAllowList()
      .pipe(
        take(1),
        catchError(() => of([]))
      )
      .subscribe((allow: any) => {
        this.allowDataSource.data = Array.isArray(allow) ? allow : [];
        this.cdr.markForCheck();
      });
  }
}
