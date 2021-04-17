import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  FormArray,
  Validators
} from '@angular/forms';
import {Observable} from 'rxjs';
import {pairwise, map, startWith} from 'rxjs/operators';

import { DataServicesService } from './data-services.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'eq-front';
  productsTypes = [
    {
      name: 'Материалы',
      id: 1
    },
    {
      name: 'Консультации',
      id: 2
    },
    {
      name: 'Налоксон',
      id: 3
    },
    {
      name: 'Тест',
      id: 4
    },
  ]
  products = [
    {
      name: 'Шприц 1мл (кр. шапочки)',
      type: 1,
      id:1
    },
    {
      name: 'шприц 2 мл',
      type: 1,
      id:2
    },
    {
      name: 'презерватив',
      type: 1,
      id:3
    },
    {
      name: 'шприц 1мл (съемки)',
      type: 1,
      id:4
    },
    {
      name: 'шприц 3 мл',
      type: 1,
      id:5
    },
    {
      name: 'шприц 5 мл',
      type: 1,
      id:6
    },
    {
      name: 'шприц 10 мл',
      type: 1,
      id:7
    },
    {
      name: 'Медицинские консультации и услуги',
      type: 2,
      id:8
    },
    {
      name: 'Сопровождение в органы власти',
      type: 2,
      id:9
    },
    {
      name: 'Консультации родственникам',
      type: 2,
      id:10
    },
    {
      name: 'Жалобы в гос. органы',
      type: 2,
      id:11
    },
    {
      name: 'Налоксон',
      type: 3,
      id:12
    }
  ];
  filteredProducts: Observable<{name:string, id: number, type:number}[]>[] = [];
  checkoutForm = this.fb.group({
    recipient: new FormControl('', [
      Validators.required,
      Validators.pattern(/[А-Я]{2}[0-9]{2}[0|1][0-9]{3}[А-Я]{2}[Ж|М]|[а-я]{2}[0-9]{2}[0|1][0-9]{3}[а-я]{2}[ж|м]/i) // <-- Here's how you pass in the custom validator.
    ]),
    services: this.fb.array([
      this.buildNewGroup()
    ])
  })



  constructor(
    private fb: FormBuilder,
    private dataServices: DataServicesService
  ) {
    this.manageNameControl(0);
  }

  manageNameControl(index: number) {
    let arrayControl = this.checkoutForm.get('services') as FormArray;
    arrayControl.at(index).get('name').valueChanges.subscribe(x => {
      if(typeof x !== 'string') {
        this.setProductType(x, index);
      }
    })
    arrayControl.at(index).get('type').valueChanges
    .pipe(
      startWith(''),
      pairwise())
    .subscribe(([prev, next]) => {
      if (prev !== next) {
        arrayControl.at(index).get('name').updateValueAndValidity({ onlySelf: false, emitEvent: true });
      }
    })
    this.filteredProducts[index] = arrayControl.at(index).get('name').valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.name),
        map(value => this._filter(value, index))
      );

  }
  addControl() {
    const arrayControl = <FormArray>this.checkoutForm.get('services') as FormArray;
    let formGroup = this.buildNewGroup();
    arrayControl.push(formGroup);
    this.manageNameControl(arrayControl.length - 1);

  }
  removeControl(index) {
    const arrayControl = <FormArray>this.checkoutForm.get('services') as FormArray;
    arrayControl.removeAt(index);
  }
  private _filter(value: string, index: number): {name:string, id: number, type:number}[] {
    const arrayControl = <FormArray>this.checkoutForm.get('services') as FormArray;
    const type = arrayControl.controls[index].get('type').value;
    const filteredByType = type ? this.products.filter(option => option.type === type) : this.products;
    const filterValue = value.toLowerCase();
    return filteredByType.filter(option => option.name.toLowerCase().indexOf(filterValue) === 0);
  }

  getProductName(product) {
    return product.name
  }

  setProductType(product, index) {
    const arrayControl = <FormArray>this.checkoutForm.get('services') as FormArray;
    arrayControl.controls[index].get('type').setValue(product.type);
  }

  buildNewGroup() {
    return this.fb.group({
      type: new FormControl('', [
        Validators.required
      ]),
      name:new FormControl('', [
        Validators.required,
      ]),
      volume:new FormControl('', [
        Validators.required,
        Validators.min(1),
      ])
    })
  }

  onSubmit(): void {
    if(this.checkoutForm.valid) {
      this.dataServices.saveServices(
        this.checkoutForm.value.recipient,
        this.serializeData(this.checkoutForm.value.services))
    }
  }
  serializeData(services) {
    return services.map(service => {
      return {
        volume: service.volume,
        id: service.name.id
      }
    })
  }
}
