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
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** rxjs Imports */
import { take } from 'rxjs';

/** Custom Services */
import { ChannelingService } from '../channeling.service';

/**
 * Attribution board: attribute loan disbursements and payments to channel
 * partners, and browse the attribution log. Re-attribution moves the row.
 */
@Component({
  selector: 'mifosx-attribution-board',
  templateUrl: './attribution-board.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ReactiveFormsModule,
    FaIconComponent,
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
export class AttributionBoardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private channelingService = inject(ChannelingService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  attributionsDataSource = new MatTableDataSource<any>([]);
  attributionColumns: string[] = [
    'entityType',
    'entityId',
    'partner',
    'attributedBy',
    'attributedOn',
    'actions'
  ];

  partners: any[] = [];

  attributeForm: FormGroup = this.formBuilder.group({
    entityType: [
      'LOAN',
      [Validators.required]
    ],
    entityId: [
      '',
      [
        Validators.required,
        Validators.pattern('^[0-9]+$')
      ]
    ],
    partnerCode: [
      '',
      [Validators.required]
    ]
  });

  ngOnInit(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { board: any }) => {
      this.attributionsDataSource.data = Array.isArray(data.board?.attributions) ? data.board.attributions : [];
      this.partners = Array.isArray(data.board?.partners) ? data.board.partners : [];
    });
  }

  attribute(): void {
    const v = this.attributeForm.value;
    this.channelingService
      .attributeMoney(v.entityType, Number(v.entityId), v.partnerCode)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.attributeForm.reset({ entityType: 'LOAN', entityId: '', partnerCode: '' });
        this.reload();
      });
  }

  remove(id: number): void {
    this.channelingService
      .removeAttribution(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  private reload(): void {
    this.channelingService
      .getAttributions()
      .pipe(take(1))
      .subscribe((rows: any) => {
        this.attributionsDataSource.data = Array.isArray(rows) ? rows : [];
        this.cdr.markForCheck();
      });
  }
}
