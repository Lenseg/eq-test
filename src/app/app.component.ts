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
  serviceTypes = [
    {
      id:1,
      name: "Материалы"
    },{
      id: 2,
      name: "Консультации"
    },{
      id:3,
      name: "Налоксон"
    },{
      id:4,
      name: "Тест"
    }
  ];
  services = [];
  filteredServices: Observable<{name:string, id: number, type:number}[]>[] = [];
  checkoutForm = this.fb.group({
    recipient: new FormControl('', [
      Validators.required,
      Validators.pattern(/[А-Я]{2}[0-9]{2}[0|1][0-9]{3}[А-Я]{2}[Ж|М]|[а-я]{2}[0-9]{2}[0|1][0-9]{3}[а-я]{2}[ж|м]/i) // <-- Here's how you pass in the custom validator.
    ]),
    services: this.fb.array([
      this.buildNewGroup()
    ])
  })
  loader = false


  constructor(
    private fb: FormBuilder,
    private dataServices: DataServicesService
  ) {
    this.manageNameControl(0);
    this.getServices();
  }

  manageNameControl(index: number) {
    let arrayControl = this.checkoutForm.get('services') as FormArray;
    arrayControl.at(index).get('name').valueChanges.subscribe(x => {
      if(typeof x !== 'string') {
        this.setServiceType(x, index);
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
    this.filteredServices[index] = arrayControl.at(index).get('name').valueChanges
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
    const filteredByType = type && this.services ? this.services.filter(option => option.type === type) : this.services;
    const filterValue = value.toLowerCase();
    return filteredByType.filter(option => option.name.toLowerCase().indexOf(filterValue) === 0);
  }

  getServiceName(service) {
    return service.name
  }

  setServiceType(service, index) {
    const arrayControl = <FormArray>this.checkoutForm.get('services') as FormArray;
    arrayControl.controls[index].get('type').setValue(service.type);
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
      this.loader = true
      this.dataServices.createTransactions(
        this.serializeData(this.checkoutForm.value.services, this.checkoutForm.value.recipient)
      ).subscribe((services:[]) => this.loader = false)
    }
  }
  serializeData(services, recipient) {
    return services.map(service => {
      return {
        volume: service.volume,
        id: service.id,
        recipient: recipient
      }
    })
  }
  getServices() {
    this.dataServices.getServices()
      .subscribe((services:[]) => this.services = services);
  }
}
