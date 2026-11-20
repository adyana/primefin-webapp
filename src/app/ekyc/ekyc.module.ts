/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0.
 */
/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0.
 */

/** Angular Imports */
import { NgModule } from '@angular/core';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { PipesModule } from '../pipes/pipes.module';
import { EkycRoutingModule } from './ekyc-routing.module';

/** Custom Components */
import { EkycPageComponent } from './ekyc-page/ekyc-page.component';

/**
 * e-KYC Digital Onboarding Module.
 * Customer-facing e-KYC onboarding flow: NIK verification, face match,
 * document upload, final submit and status tracking.
 */
@NgModule({
  imports: [
    SharedModule,
    PipesModule,
    EkycRoutingModule,
    EkycPageComponent
  ]
})
export class EkycModule {}
