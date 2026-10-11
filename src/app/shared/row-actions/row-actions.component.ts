/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Row action descriptor for {@link RowActionsComponent}.
 */
export interface RowAction {
  /** Stable id emitted on click (row context stays with the parent). */
  id: string;
  /** i18n key for the tooltip / button text / menu item. */
  labelKey: string;
  /** fa-icon name for icon-group rendering; absent forces menu mode. */
  icon?: string;
  /** Material button color. */
  color?: 'primary' | 'accent' | 'warn';
  /** Permission gate (`*mifosxHasPermission`); ungated when absent. */
  permission?: string | string[];
  /** Disabled state (still rendered, non-clickable). */
  disabled?: boolean;
  /** Visibility (status-conditional actions); default true. */
  visible?: boolean;
}

/**
 * Standard row-action set (PrimeFin page standard): one action renders
 * a text button, two-to-three render the mandates icon group with
 * tooltips, four-or-more collapse into an overflow menu. Permission
 * gates, disabled states and tooltips are preserved per action.
 *
 * Usage:
 * ```
 * <mifosx-row-actions
 *   [actions]="[
 *     { id: 'collect', labelKey: 'labels.buttons.Collect', icon: 'download', permission: 'UPDATE_PAYMENT' }
 *   ]"
 *   (action)="onRowAction($event, row)"
 * />
 * ```
 */
@Component({
  selector: 'mifosx-row-actions',
  templateUrl: './row-actions.component.html',
  styleUrls: ['./row-actions.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    NgxTranslatePipe,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatTooltip,
    FaIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RowActionsComponent {
  /** Full action set; visibility is resolved per action. */
  @Input() actions: RowAction[] = [];

  /** `auto` (default), `icons` (force icon group) or `menu` (force overflow). */
  @Input() mode: 'auto' | 'icons' | 'menu' = 'auto';

  /** Emitted with the action id on click. */
  @Output() action = new EventEmitter<string>();

  /** Actions passing the visibility flag. */
  get visible(): RowAction[] {
    return this.actions.filter((a) => a.visible !== false);
  }

  /** Overflow menu when forced, when 4+ visible, or when icons are missing. */
  get useMenu(): boolean {
    if (this.mode === 'menu') {
      return true;
    }
    if (this.mode === 'icons') {
      return false;
    }
    const visible = this.visible;
    return visible.length > 3 || (visible.length > 1 && visible.some((a) => !a.icon));
  }

  /** Single action renders as a text button (never a lone icon). */
  get single(): boolean {
    return !this.useMenu && this.visible.length === 1;
  }

  fire(id: string): void {
    this.action.emit(id);
  }
}
