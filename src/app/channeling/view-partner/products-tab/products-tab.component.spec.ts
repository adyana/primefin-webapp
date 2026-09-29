/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { of } from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';

import { ChannelingService } from '../../channeling.service';
import { ProductsTabComponent } from './products-tab.component';

describe('ProductsTabComponent', () => {
  let component: ProductsTabComponent;
  let fixture: ComponentFixture<ProductsTabComponent>;
  let channelingService: {
    getProducts: jest.Mock;
    createProduct: jest.Mock;
    deleteProduct: jest.Mock;
  };

  beforeEach(async () => {
    channelingService = {
      getProducts: jest.fn().mockReturnValue(of([{ id: 9, partnerProductCode: 'LP1', ourProductId: 3 }])),
      createProduct: jest.fn().mockReturnValue(of({ resourceId: 10 })),
      deleteProduct: jest.fn().mockReturnValue(of({}))
    };

    await TestBed.configureTestingModule({
      imports: [
        ProductsTabComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ChannelingService, useValue: channelingService },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions: ['CREATE_CHANNEL'] }) } },
        provideNoopAnimations()
      ]
    }).compileComponents();

    TestBed.inject(FaIconLibrary).addIcons(faPlus, faTrash);
    fixture = TestBed.createComponent(ProductsTabComponent);
    component = fixture.componentInstance;
    component.partnerId = 7;
    fixture.detectChanges();
  });

  it('should load this partner mappings scoped by partner', () => {
    expect(channelingService.getProducts).toHaveBeenCalledWith(7);
    expect(component.dataSource.data).toEqual([{ id: 9, partnerProductCode: 'LP1', ourProductId: 3 }]);
  });

  it('should create a mapping with the partner attached and refresh', () => {
    component.mappingForm.setValue({ partnerProductCode: 'LP2', ourProductId: '5' });
    component.submit();

    expect(channelingService.createProduct).toHaveBeenCalledWith({
      partnerId: 7,
      partnerProductCode: 'LP2',
      ourProductId: 5
    });
    expect(channelingService.getProducts).toHaveBeenCalledTimes(2);
  });

  it('should delete a mapping and refresh', () => {
    component.remove(9);

    expect(channelingService.deleteProduct).toHaveBeenCalledWith(9);
    expect(channelingService.getProducts).toHaveBeenCalledTimes(2);
  });
});
