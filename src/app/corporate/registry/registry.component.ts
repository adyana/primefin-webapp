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

/** Shared Page Standard */
import { PageToolbarComponent } from '../../shared/page-toolbar/page-toolbar.component';
import { StatusPillComponent } from '../../shared/status-pill/status-pill.component';

/** rxjs Imports */
import { catchError, of } from 'rxjs';

/** Custom Services */
import { CorporateService } from '../corporate.service';

/**
 * Corporate registry board: filter by status, register corporates,
 * suspend/reactivate/close inline.
 */
@Component({
  selector: 'mifosx-corporate-registry',
  templateUrl: './registry.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    PageToolbarComponent,
    StatusPillComponent,
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
export class CorporateRegistryComponent implements OnInit {
  private corporateService = inject(CorporateService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  filtersForm: FormGroup = this.formBuilder.group({ status: ['ALL'] });
  createForm: FormGroup = this.formBuilder.group({
    code: [
      '',
      Validators.required
    ],
    name: [
      '',
      Validators.required
    ],
    segment: [
      'SME',
      Validators.required
    ],
    prefundVaId: [null]
  });

  corporatesDataSource = new MatTableDataSource<any>([]);
  corporateColumns: string[] = [
    'code',
    'name',
    'segment',
    'status',
    'prefundVa',
    'actions'
  ];

  /** Paginator for the registry table. */
  @ViewChild(MatPaginator) registryPaginator: MatPaginator;

  /** Live registry count for the toolbar badge. */
  corporatesCount: number | null = null;

  ngOnInit(): void {
    this.filtersForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.reload());
    this.reload();
  }

  filterCorporates(text: string): void {
    this.corporatesDataSource.filter = (text || '').trim().toLowerCase();
    if (this.registryPaginator) {
      this.corporatesDataSource.paginator.firstPage();
    }
  }

  create(): void {
    if (!this.createForm.valid) {
      return;
    }
    this.corporateService
      .createCorporate(this.createForm.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.createForm.reset({ segment: 'SME' });
        this.reload();
      });
  }

  suspend(row: any): void {
    this.corporateService
      .suspendCorporate(row.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  reactivate(row: any): void {
    this.corporateService
      .reactivateCorporate(row.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  close(row: any): void {
    this.corporateService
      .closeCorporate(row.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  private reload(): void {
    const status = this.filtersForm.value.status === 'ALL' ? undefined : this.filtersForm.value.status;
    this.corporateService
      .getCorporates(status)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of([]))
      )
      .subscribe((corporates: any) => {
        this.corporatesDataSource.data = Array.isArray(corporates) ? corporates : [];
        this.corporatesCount = this.corporatesDataSource.data.length;
        if (this.registryPaginator) {
          this.corporatesDataSource.paginator = this.registryPaginator;
        }
        this.cdr.markForCheck();
      });
  }
}
