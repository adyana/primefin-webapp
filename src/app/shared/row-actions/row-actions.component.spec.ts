/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { firstValueFrom } from 'rxjs';
import { RowActionsComponent } from './row-actions.component';

describe('RowActionsComponent', () => {
  it('should render a single action as a text button', () => {
    const actions = new RowActionsComponent();
    actions.actions = [{ id: 'close', labelKey: 'labels.buttons.Close' }];
    expect(actions.single).toBe(true);
    expect(actions.useMenu).toBe(false);
  });

  it('should render two-to-three actions as an icon group', () => {
    const actions = new RowActionsComponent();
    actions.actions = [
      { id: 'a', labelKey: 'A', icon: 'download' },
      { id: 'b', labelKey: 'B', icon: 'pause' },
      { id: 'c', labelKey: 'C', icon: 'ban' }
    ];
    expect(actions.single).toBe(false);
    expect(actions.useMenu).toBe(false);
  });

  it('should collapse four-or-more actions into a menu', () => {
    const actions = new RowActionsComponent();
    actions.actions = [
      { id: 'a', labelKey: 'A', icon: 'download' },
      { id: 'b', labelKey: 'B', icon: 'pause' },
      { id: 'c', labelKey: 'C', icon: 'ban' },
      { id: 'd', labelKey: 'D', icon: 'play' }
    ];
    expect(actions.useMenu).toBe(true);
  });

  it('should fall back to a menu when icons are missing', () => {
    const actions = new RowActionsComponent();
    actions.actions = [
      { id: 'a', labelKey: 'A', icon: 'download' },
      { id: 'b', labelKey: 'B' }
    ];
    expect(actions.useMenu).toBe(true);
  });

  it('should respect visibility flags', () => {
    const actions = new RowActionsComponent();
    actions.actions = [
      { id: 'a', labelKey: 'A', icon: 'download', visible: false },
      { id: 'b', labelKey: 'B', icon: 'pause' }
    ];
    expect(actions.visible.map((a) => a.id)).toEqual(['b']);
    expect(actions.single).toBe(true);
  });

  it('should emit the action id on fire', async () => {
    const actions = new RowActionsComponent();
    const seen = firstValueFrom(actions.action);
    actions.fire('suspend');
    expect(await seen).toBe('suspend');
  });
});
