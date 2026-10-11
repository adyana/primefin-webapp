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

/** Custom Services */
import { QrisService } from '../qris.service';

/**
 * MDR bands board: BI rate plus PrimeFin and agent margins per segment,
 * all editable without a deploy. A BI rate change is a data change here.
 */
@Component({
  selector: 'mifosx-qris-mdr-rules',
  templateUrl: './mdr-rules.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    PageToolbarComponent,
    ReactiveFormsModule,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatLabel,
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
export class QrisMdrRulesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private qrisService = inject(QrisService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  rulesDataSource = new MatTableDataSource<any>([]);
  ruleColumns: string[] = [
    'segment',
    'thresholdAmount',
    'biRateBps',
    'marginBps',
    'agentMarginBps',
    'actions'
  ];

  /** Paginator for rules table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  /** Rule selected for margin editing (null = no edit form). */
  selectedRule: any = null;
  editForm: FormGroup = this.formBuilder.group({
    biRateBps: [
      null,
      [
        Validators.required,
        Validators.min(0)
      ]
    ],
    marginBps: [
      null,
      [
        Validators.required,
        Validators.min(0)
      ]
    ],
    agentMarginBps: [
      null,
      [
        Validators.required,
        Validators.min(0)
      ]
    ]
  });

  ngOnInit(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { rules: any }) => {
      this.rulesDataSource.data = Array.isArray(data.rules) ? data.rules : [];
      this.rulesDataSource.paginator = this.paginator;
    });
  }

  /**
   * Filters data in rules table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  filterRules(filterValue: string) {
    this.rulesDataSource.filter = (filterValue || '').trim().toLowerCase();
  }

  selectForEdit(ruleRow: any): void {
    this.selectedRule = ruleRow;
    this.editForm.reset({
      biRateBps: ruleRow.biRateBps,
      marginBps: ruleRow.marginBps,
      agentMarginBps: ruleRow.agentMarginBps
    });
    this.cdr.markForCheck();
  }

  save(): void {
    this.qrisService
      .updateMdrRule(this.selectedRule.id, this.editForm.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.selectedRule = null;
        this.reload();
      });
  }

  private reload(): void {
    this.qrisService
      .getMdrRules()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((rules: any) => {
        this.rulesDataSource.data = Array.isArray(rules) ? rules : [];
        this.rulesDataSource.paginator = this.paginator;
        this.cdr.markForCheck();
      });
  }
}
