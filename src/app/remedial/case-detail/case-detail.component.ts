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
import { MatSelect, MatOption } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
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
import { catchError, forkJoin, of } from 'rxjs';

/** Custom Services */
import { RemedialService } from '../remedial.service';

/**
 * Collection case detail: assignment + legal/close/write-off actions,
 * visit timeline with record form, promises with kept/cancel, POJK
 * restructuring proposals with upstream sync.
 */
@Component({
  selector: 'mifosx-collection-case-detail',
  templateUrl: './case-detail.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
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
    MatButton
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionCaseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private collectionsService = inject(RemedialService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  caseId: number | null = null;
  kase: any = null;

  visitsDataSource = new MatTableDataSource<any>([]);
  visitColumns: string[] = [
    'scheduledOn',
    'visitedOn',
    'agentId',
    'outcome',
    'notes'
  ];

  ptpsDataSource = new MatTableDataSource<any>([]);
  ptpColumns: string[] = [
    'promisedOn',
    'amount',
    'status',
    'actions'
  ];

  restructuresDataSource = new MatTableDataSource<any>([]);
  restructureColumns: string[] = [
    'pojkType',
    'requestId',
    'status',
    'actions'
  ];

  assignForm: FormGroup = this.formBuilder.group({ agentId: [
      null,
      Validators.required
    ] });
  visitForm: FormGroup = this.formBuilder.group({
    agentId: [
      null,
      Validators.required
    ],
    scheduledOn: [
      '',
      Validators.required
    ],
    visitedOn: [''],
    outcome: [
      'PROMISED',
      Validators.required
    ],
    notes: ['']
  });
  promiseForm: FormGroup = this.formBuilder.group({
    promisedOn: [
      '',
      Validators.required
    ],
    amount: [
      null,
      [
        Validators.required,
        Validators.min(1)
      ]
    ]
  });
  restructureForm: FormGroup = this.formBuilder.group({
    pojkType: [
      'RESCHEDULING',
      Validators.required
    ],
    rescheduleJson: [
      '{}',
      Validators.required
    ]
  });
  writeOffForm: FormGroup = this.formBuilder.group({ reason: [
      '',
      Validators.required
    ] });

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.caseId = Number(params.get('id'));
      this.reload();
    });
  }

  assign(): void {
    if (!this.caseId || !this.assignForm.valid) {
      return;
    }
    this.collectionsService
      .assignCase(this.caseId, this.assignForm.value.agentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  escalateToLegal(): void {
    if (!this.caseId) {
      return;
    }
    this.collectionsService
      .escalateToLegal(this.caseId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  close(status: string): void {
    if (!this.caseId) {
      return;
    }
    this.collectionsService
      .closeCase(this.caseId, status)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  recordVisit(): void {
    if (!this.caseId || !this.visitForm.valid) {
      return;
    }
    this.collectionsService
      .recordVisit(this.caseId, this.visitForm.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.visitForm.reset({ outcome: 'PROMISED' });
        this.reload();
      });
  }

  createPromise(): void {
    if (!this.caseId || !this.promiseForm.valid) {
      return;
    }
    this.collectionsService
      .createPtp(this.caseId, this.promiseForm.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.promiseForm.reset();
        this.reload();
      });
  }

  markKept(ptpId: number): void {
    this.collectionsService
      .markPtpKept(ptpId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  cancelPtp(ptpId: number): void {
    this.collectionsService
      .cancelPtp(ptpId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  evaluatePtps(): void {
    this.collectionsService
      .evaluatePtps()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  proposeRestructure(): void {
    if (!this.caseId || !this.restructureForm.valid) {
      return;
    }
    this.collectionsService
      .proposeRestructure(this.caseId, this.restructureForm.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.restructureForm.reset({ pojkType: 'RESCHEDULING' });
        this.reload();
      });
  }

  syncRestructure(restructureId: number, status: string): void {
    this.collectionsService
      .syncRestructure(restructureId, status)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  writeOff(): void {
    if (!this.caseId || !this.writeOffForm.valid) {
      return;
    }
    this.collectionsService
      .writeOffCase(this.caseId, this.writeOffForm.value.reason)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.writeOffForm.reset();
        this.reload();
      });
  }

  private reload(): void {
    if (!this.caseId) {
      return;
    }
    forkJoin({
      kase: this.collectionsService.getCase(this.caseId).pipe(catchError(() => of(null))),
      visits: this.collectionsService.getVisits(this.caseId).pipe(catchError(() => of([]))),
      ptps: this.collectionsService.getPtps(this.caseId).pipe(catchError(() => of([]))),
      restructures: this.collectionsService.getRestructures(this.caseId).pipe(catchError(() => of([])))
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: any) => {
        this.kase = result.kase;
        this.visitsDataSource.data = Array.isArray(result.visits) ? result.visits : [];
        this.ptpsDataSource.data = Array.isArray(result.ptps) ? result.ptps : [];
        this.restructuresDataSource.data = Array.isArray(result.restructures) ? result.restructures : [];
        this.cdr.markForCheck();
      });
  }
}
