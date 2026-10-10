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
import { ActivatedRoute } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
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

/** Shared Page Standard */
import { PageToolbarComponent } from '../../shared/page-toolbar/page-toolbar.component';
import { StatusPillComponent } from '../../shared/status-pill/status-pill.component';

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
    PageToolbarComponent,
    StatusPillComponent,
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
    MatButton,
    MatPaginator
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
    'createdOn',
    'actions'
  ];

  allowDataSource = new MatTableDataSource<any>([]);
  allowColumns: string[] = [
    'subjectType',
    'normValue',
    'reason',
    'status',
    'actions'
  ];

  /** Live table counts for the toolbar badges. */
  listsCount: number | null = null;
  entriesCount: number | null = null;
  hitsCount: number | null = null;
  allowCount: number | null = null;

  /** Paginators for the four board tables. */
  @ViewChild('listsPaginator', { static: true }) listsPaginator: MatPaginator;
  @ViewChild('entriesPaginator') entriesPaginator: MatPaginator;
  @ViewChild('hitsPaginator', { static: true }) hitsPaginator: MatPaginator;
  @ViewChild('allowPaginator', { static: true }) allowPaginator: MatPaginator;

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
      this.listsCount = this.listsDataSource.data.length;
      this.listsDataSource.paginator = this.listsPaginator;
    });
    this.reloadHits();
    this.reloadAllow();
  }

  filterLists(text: string): void {
    this.listsDataSource.filter = (text || '').trim().toLowerCase();
    if (this.listsPaginator) {
      this.listsDataSource.paginator.firstPage();
    }
  }

  filterEntries(text: string): void {
    this.entriesDataSource.filter = (text || '').trim().toLowerCase();
    if (this.entriesPaginator) {
      this.entriesDataSource.paginator.firstPage();
    }
  }

  filterHits(text: string): void {
    this.hitsDataSource.filter = (text || '').trim().toLowerCase();
    if (this.hitsPaginator) {
      this.hitsDataSource.paginator.firstPage();
    }
  }

  filterAllow(text: string): void {
    this.allowDataSource.filter = (text || '').trim().toLowerCase();
    if (this.allowPaginator) {
      this.allowDataSource.paginator.firstPage();
    }
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

  /**
   * Maker step from a hit: prefill the release form with the hit's subject
   * so ops only supplies the reason. Creates a PENDING release.
   */
  requestRelease(hitRow: any): void {
    this.allowForm.reset({
      subjectType: hitRow.entry?.subjectType ?? 'NAME',
      value: hitRow.rawValue,
      reason: ''
    });
    this.cdr.markForCheck();
  }

  /**
   * Checker step: approve a pending release. The backend rejects
   * self-approval; a different user must approve.
   */
  approveAllow(allowRow: any): void {
    this.complianceService
      .approveAllow(allowRow.id)
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
        this.entriesCount = this.entriesDataSource.data.length;
        if (this.entriesPaginator) {
          this.entriesDataSource.paginator = this.entriesPaginator;
        }
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
        this.hitsCount = this.hitsDataSource.data.length;
        this.hitsDataSource.paginator = this.hitsPaginator;
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
        this.allowCount = this.allowDataSource.data.length;
        this.allowDataSource.paginator = this.allowPaginator;
        this.cdr.markForCheck();
      });
  }
}
