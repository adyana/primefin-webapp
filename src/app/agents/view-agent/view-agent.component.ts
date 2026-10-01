/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { take } from 'rxjs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { TransactionsTabComponent } from './transactions-tab/transactions-tab.component';
import { CommissionsTabComponent } from './commissions-tab/commissions-tab.component';

/** Custom Services */
import { AgentsService } from '../agents.service';

/**
 * Agent detail shell with float actions and transaction/commission tabs.
 */
@Component({
  selector: 'mifosx-view-agent',
  templateUrl: './view-agent.component.html',
  styleUrls: ['./view-agent.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ReactiveFormsModule,
    RouterLink,
    FaIconComponent,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatButton,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatTabGroup,
    MatTab,
    TransactionsTabComponent,
    CommissionsTabComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewAgentComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private agentsService = inject(AgentsService);
  private formBuilder = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  /** Agent data from the resolver (undefined when the id is unknown). */
  agentData: any;

  /** Top-up form (amount + rail; idempotency key minted per submit). */
  topUpForm: FormGroup = this.formBuilder.group({
    amount: [
      null,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],
    currency: ['IDR'],
    rail: ['ICT']
  });

  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { agent: any }) => {
      this.agentData = data.agent;
    });
  }

  /**
   * Submits a float top-up, then reloads the agent to show the new balance.
   */
  topUp() {
    const payload = {
      ...this.topUpForm.getRawValue(),
      idempotencyKey: crypto.randomUUID()
    };
    this.agentsService
      .topUpAgent(this.agentData.id, payload)
      .pipe(take(1))
      .subscribe(() => this.reload());
  }

  /**
   * Suspends the agent, then reloads.
   */
  suspend() {
    this.agentsService
      .suspendAgent(this.agentData.id, {})
      .pipe(take(1))
      .subscribe(() => this.reload());
  }

  /**
   * Closes the agent (backend refuses non-zero float), then reloads.
   */
  close() {
    this.agentsService
      .closeAgent(this.agentData.id, {})
      .pipe(take(1))
      .subscribe(() => this.reload());
  }

  private reload() {
    this.agentsService
      .getAgent(this.agentData.id)
      .pipe(take(1))
      .subscribe((agent: any) => {
        this.agentData = agent;
        this.topUpForm.reset({ amount: null, currency: 'IDR', rail: 'ICT' });
        this.cdr.markForCheck();
      });
  }
}
