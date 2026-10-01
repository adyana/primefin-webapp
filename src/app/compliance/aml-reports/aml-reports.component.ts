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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
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
 * PPATK reports board: LTKT/LTKL generation over a window with goAML XML
 * download. STR reports arise only from approved cases. Portal upload stays
 * a human compliance act.
 */
@Component({
  selector: 'mifosx-aml-reports',
  templateUrl: './aml-reports.component.html',
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
    MatDatepickerModule,
    MatNativeDateModule,
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
export class AmlReportsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private complianceService = inject(ComplianceService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  reportsDataSource = new MatTableDataSource<any>([]);
  reportColumns: string[] = [
    'reportType',
    'period',
    'status',
    'actions'
  ];

  generateForm: FormGroup = this.formBuilder.group({
    reportType: [
      'LTKT',
      Validators.required
    ],
    from: [
      null,
      Validators.required
    ],
    to: [
      null,
      Validators.required
    ]
  });

  reportTypes: string[] = [
    'LTKT',
    'LTKL'
  ];

  ngOnInit(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { reports: any }) => {
      this.reportsDataSource.data = Array.isArray(data.reports) ? data.reports : [];
    });
  }

  generate(): void {
    const raw = this.generateForm.getRawValue();
    const payload = {
      reportType: raw.reportType,
      from: raw.from instanceof Date ? raw.from.toISOString().slice(0, 10) : raw.from,
      to: raw.to instanceof Date ? raw.to.toISOString().slice(0, 10) : raw.to
    };
    this.complianceService
      .generateReport(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  download(reportRow: any): void {
    this.complianceService.downloadReport(reportRow.id);
  }

  private reload(): void {
    this.complianceService
      .getAmlReports()
      .pipe(
        take(1),
        catchError(() => of([]))
      )
      .subscribe((reports: any) => {
        this.reportsDataSource.data = Array.isArray(reports) ? reports : [];
        this.cdr.markForCheck();
      });
  }
}
