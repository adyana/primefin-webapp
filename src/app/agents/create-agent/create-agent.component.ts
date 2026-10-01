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
import { AgentsService } from '../agents.service';

/**
 * Create agent component.
 */
@Component({
  selector: 'mifosx-create-agent',
  templateUrl: './create-agent.component.html',
  styleUrls: ['./create-agent.component.scss'],
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
export class CreateAgentComponent implements OnInit {
  private agentsService = inject(AgentsService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  /** Agent form. */
  agentForm: FormGroup;

  ngOnInit() {
    this.createAgentForm();
  }

  /**
   * Creates the agent form. The backend requires an idempotency key and a
   * non-negative commission in basis points; both are captured here.
   */
  createAgentForm() {
    this.agentForm = this.formBuilder.group({
      code: [
        '',
        Validators.required
      ],
      name: [
        '',
        Validators.required
      ],
      location: [''],
      commissionBps: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ]
    });
  }

  /**
   * Submits the agent form with a fresh idempotency key.
   */
  submit() {
    const payload = {
      ...this.agentForm.getRawValue(),
      idempotencyKey: crypto.randomUUID(),
      status: 'ACTIVE'
    };
    this.agentsService
      .createAgent(payload)
      .pipe(take(1))
      .subscribe(() => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }
}
