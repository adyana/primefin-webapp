/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Custom Services */
import { ChannelingService } from '../channeling.service';

/**
 * Create channel partner component.
 */
@Component({
  selector: 'mifosx-create-partner',
  templateUrl: './create-partner.component.html',
  styleUrls: ['./create-partner.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ReactiveFormsModule,
    RouterLink,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatButton
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreatePartnerComponent implements OnInit {
  private channelingService = inject(ChannelingService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  /** Partner form. */
  partnerForm: FormGroup;

  ngOnInit() {
    this.createPartnerForm();
  }

  /**
   * Creates the partner form. Code doubles as the SFTP username and the rail
   * id suffix (channel-<code>), so it is restricted to lowercase/digits/dash.
   */
  createPartnerForm() {
    this.partnerForm = this.formBuilder.group({
      code: [
        '',
        [
          Validators.required,
          Validators.pattern('^[a-z0-9-]+$')
        ]
      ],
      name: [
        '',
        Validators.required
      ],
      status: [
        'ACTIVE',
        Validators.required
      ],
      contact: [''],
      sftpUsername: [''],
      pgpKeyRef: ['']
    });
  }

  /**
   * Submits the partner form; defaults the SFTP username to the code.
   */
  submit() {
    const payload = this.partnerForm.getRawValue();
    if (!payload.sftpUsername) {
      payload.sftpUsername = payload.code;
    }
    this.channelingService
      .createPartner(payload)
      .pipe(take(1))
      .subscribe(() => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }
}
