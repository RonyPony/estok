import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { DocumentCreatePageComponent } from './document-create-page';
import { InventoryApiService } from '../inventory/inventory-api.service';
import { SalesApiService } from './sales-api.service';
import { Product } from '../products/products-api.service';

const product:Product={id:'one',sku:'ONE',name:'Producto uno',cost:40,salePrice:100,taxRate:18,minimumStock:0,barcode:'',description:'',trackInventory:false};

describe('Document editor state and taxes',()=>{
  const create=vi.fn(()=>of({id:'sale'}));
  beforeEach(()=>{
    create.mockClear();
    TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting(),provideRouter([]),
      {provide:ActivatedRoute,useValue:{snapshot:{data:{}}}},
      {provide:InventoryApiService,useValue:{warehouses:()=>of([{id:'warehouse',name:'Principal'}])}},
      {provide:SalesApiService,useValue:{create}}
    ]});
  });
  it('renders the second line, edits totals, removes and re-adds without manual change detection',async()=>{
    const fixture=TestBed.createComponent(DocumentCreatePageComponent);const page=fixture.componentInstance;
    await fixture.whenStable();
    page.selectProduct(product);page.addPending();await fixture.whenStable();
    page.selectProduct({...product,id:'two',name:'Producto dos'});page.addPending();await fixture.whenStable();
    const rows=()=>fixture.nativeElement.querySelectorAll('app-sale-items tbody tr');
    expect(rows().length).toBe(2);
    const quantity=rows()[0].querySelector('input');quantity.value='2';quantity.dispatchEvent(new Event('input',{bubbles:true}));
    await fixture.whenStable();expect(page.total()).toBe(354);
    expect(fixture.nativeElement.querySelector('app-sale-totals').textContent).toContain('354.00');
    rows()[0].querySelector('button').click();await fixture.whenStable();
    expect(rows().length).toBe(1);expect(page.productIds()).toEqual(['two']);expect(page.total()).toBe(118);
    page.selectProduct(product);page.addPending();await fixture.whenStable();expect(rows().length).toBe(2);
    page.selectProduct(product);expect(page.pendingProduct()).toBeNull();
  });
  it('includes tax in the entered price after discount and sends the selected mode',async()=>{
    const fixture=TestBed.createComponent(DocumentCreatePageComponent);const page=fixture.componentInstance;
    vi.spyOn(TestBed.inject(Router),'navigate').mockResolvedValue(true);
    page.selectProduct(product);page.addPending();
    page.form.controls.items.at(0).controls.discount.setValue(10);
    expect(page.tax()).toBe(16.2);expect(page.total()).toBe(106.2);
    page.form.controls.pricesIncludeTax.setValue(true);
    await fixture.whenStable();expect(page.tax()).toBe(13.73);expect(page.total()).toBe(90);
    expect(fixture.nativeElement.querySelector('app-sale-totals').textContent).toContain('Impuestos incluidos');
    page.paymentForm.controls.paymentMethodId.setValue('cash');page.payTotal();page.save();
    expect(create).toHaveBeenCalledWith(expect.objectContaining({pricesIncludeTax:true,payments:[{amount:90,paymentMethodId:'cash'}]}));
    page.form.controls.pricesIncludeTax.setValue(false);expect(page.total()).toBe(106.2);
  });
  it('rounds fractional quantities and small taxes per line',()=>{
    const page=TestBed.createComponent(DocumentCreatePageComponent).componentInstance;
    page.selectProduct({...product,salePrice:1.005,taxRate:50});page.addPending();
    expect(page.subtotal()).toBe(1.01);expect(page.tax()).toBe(.51);expect(page.total()).toBe(1.52);
    page.form.controls.pricesIncludeTax.setValue(true);expect(page.tax()).toBe(.34);expect(page.total()).toBe(1.01);
    page.form.controls.items.at(0).controls.discount.setValue(1.01);expect(page.tax()).toBe(0);expect(page.total()).toBe(0);
  });
});
