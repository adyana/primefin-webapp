/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { ProductsTabComponent } from './products-tab/products-tab.component';
import { RatesTabComponent } from './rates-tab/rates-tab.component';
import { CapsTabComponent } from './caps-tab/caps-tab.component';
import { WindowsTabComponent } from './windows-tab/windows-tab.component';
import { FilesTabComponent } from './files-tab/files-tab.component';

/**
 * Channel partner detail shell. Product/rate/cap/window tabs land in slice 2.
 */
@Component({
  selector: 'mifosx-view-partner',
  templateUrl: './view-partner.component.html',
  styleUrls: ['./view-partner.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    RouterLink,
    FaIconComponent,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatButton,
    MatTabGroup,
    MatTab,
    ProductsTabComponent,
    RatesTabComponent,
    CapsTabComponent,
    WindowsTabComponent,
    FilesTabComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewPartnerComponent {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  /** Partner data from the resolver (undefined when the id is unknown). */
  partnerData: any;

  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { partner: any }) => {
      this.partnerData = data.partner;
    });
  }
}
