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
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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

/** rxjs Imports */
import { catchError, of } from 'rxjs';

/** Custom Services */
import { RemedialService } from '../remedial.service';

/** Shared Page Standard */
import { PageToolbarComponent } from '../../shared/page-toolbar/page-toolbar.component';
import { StatusPillComponent } from '../../shared/status-pill/status-pill.component';
/**
 * Collections workbench: delinquent-loan queue with stage/status/agent
 * filters, one-click arrears sweep and drill-down into the case.
 */
@Component({
  selector: 'mifosx-collections-workbench',
  templateUrl: './workbench.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    PageToolbarComponent,
    StatusPillComponent,
    ReactiveFormsModule,
    RouterLink,
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
export class CollectionsWorkbenchComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private collectionsService = inject(RemedialService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  filtersForm: FormGroup = this.formBuilder.group({ status: ['OPEN'], stage: ['ALL'] });

  casesDataSource = new MatTableDataSource<any>([]);
  caseColumns: string[] = [
    'loanId',
    'clientId',
    'dpd',
    'overdue',
    'stage',
    'status',
    'agent',
    'nextAction'
  ];

  /** Last sweep counts (null = no sweep run yet this session). */
  sweepResult: any = null;

  /** Live queue count for the toolbar badge. */
  casesCount: number | null = null;

  /** Paginator for the queue table. */
  @ViewChild(MatPaginator) queuePaginator: MatPaginator;

  ngOnInit(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { cases: any }) => {
      this.casesDataSource.data = Array.isArray(data.cases) ? data.cases : [];
      this.attachPaginator();
    });
    this.filtersForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.reload());
    this.reload();
  }

  sweep(): void {
    this.collectionsService
      .sweepCases()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: any) => {
        this.sweepResult = result;
        this.reload();
      });
  }

  openCase(row: any): void {
    this.router.navigate(
      [
        'cases',
        row.id
      ],
      { relativeTo: this.route }
    );
  }

  private reload(): void {
    const status = this.filtersForm.value.status === 'ALL' ? undefined : this.filtersForm.value.status;
    this.collectionsService
      .getCases(status)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => of([]))
      )
      .subscribe((cases: any) => {
        const stage = this.filtersForm.value.stage ?? 'ALL';
        const rows = Array.isArray(cases) ? cases : [];
        this.casesDataSource.data = stage === 'ALL' ? rows : rows.filter((row: any) => row.stage === stage);
        this.casesCount = this.casesDataSource.data.length;
        this.attachPaginator();
        this.cdr.markForCheck();
      });
  }

  filterCases(text: string): void {
    this.casesDataSource.filter = (text || '').trim().toLowerCase();
    if (this.queuePaginator) {
      this.casesDataSource.paginator.firstPage();
    }
  }

  private attachPaginator(): void {
    if (this.queuePaginator) {
      this.casesDataSource.paginator = this.queuePaginator;
    }
  }
}
