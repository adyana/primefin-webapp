/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';

/**
 * Standard board toolbar (PrimeFin page standard, Phase 1): search field
 * with clear affordance, live count badge and an optional export action.
 * Mirrors the loans board toolbar that defines the house style.
 *
 * Usage:
 * ```
 * <mifosx-page-toolbar
 *   searchPlaceholder="labels.text.SearchByLoan"
 *   [count]="totalRows"
 *   countNoun="labels.menus.Loans"
 *   [showExport]="true"
 *   [exportDisabled]="exporting"
 *   (searchChange)="onSearchInput($event)"
 *   (export)="exportToXlsx()"
 * />
 * ```
 */
@Component({
  selector: 'mifosx-page-toolbar',
  templateUrl: './page-toolbar.component.html',
  styleUrls: ['./page-toolbar.component.scss'],
  imports: [
    CommonModule,
    NgxTranslatePipe,
    MatFormField,
    MatInput,
    MatIcon,
    MatIconButton
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageToolbarComponent {
  /** i18n key for the search input placeholder. */
  @Input() searchPlaceholder = '';

  /** Total rows behind the board; badge hidden when null. */
  @Input() count: number | null = null;

  /** i18n key for the count noun (lowercased at render, loans-style). */
  @Input() countNoun = '';

  /** Show the export icon-button. */
  @Input() showExport = false;

  /** Disable the export action while a previous export runs. */
  @Input() exportDisabled = false;

  /** i18n key for the export button title. */
  @Input() exportTitle = 'labels.buttons.Export';

  /** Emitted per keystroke with the raw search text. */
  @Output() searchChange = new EventEmitter<string>();

  /** Emitted when the export action fires. */
  @Output() export = new EventEmitter<void>();
}
