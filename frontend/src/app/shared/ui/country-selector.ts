import { Component, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';

const codes = 'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(' ');
const names = new Intl.DisplayNames(['es'], { type: 'region' });
const countries = codes.map(code => ({ code, name: names.of(code) ?? code })).sort((a,b) => a.name.localeCompare(b.name, 'es'));
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');

@Component({
 selector: 'app-country-selector',
 imports: [MatAutocompleteModule, MatInputModule],
 providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CountrySelectorComponent), multi: true}],
 template: `<mat-form-field appearance="outline"><mat-label>País</mat-label>
 <input matInput autocomplete="country-name" [value]="text()" [disabled]="disabled()" (input)="search($event)" (blur)="touch()" [matAutocomplete]="options" />
 <mat-autocomplete #options="matAutocomplete" (optionSelected)="select($event.option.value)">
 @for(country of filtered(); track country.code){<mat-option [value]="country.code">{{country.name}} ({{country.code}})</mat-option>}
 @empty{<mat-option disabled>No se encontraron países</mat-option>}
 </mat-autocomplete><mat-hint>Busca por nombre o código y selecciona un país.</mat-hint></mat-form-field>`,
 styles: ':host{display:block}mat-form-field{width:100%}'
})
export class CountrySelectorComponent implements ControlValueAccessor {
 readonly text=signal(''); readonly disabled=signal(false); readonly filtered=signal(countries);
 private change: (value:string)=>void = () => {}; touch: ()=>void = () => {};
 writeValue(code:string){this.text.set(countries.find(c=>c.code===code)?.name??code??'');this.filtered.set(countries);}
 registerOnChange(fn:(value:string)=>void){this.change=fn;}
 registerOnTouched(fn:()=>void){this.touch=fn;}
 setDisabledState(value:boolean){this.disabled.set(value);}
 search(event:Event){const value=(event.target as HTMLInputElement).value;this.text.set(value);this.change('');const query=normalize(value);this.filtered.set(countries.filter(c=>normalize(c.name+' '+c.code).includes(query)));}
 select(code:string){this.writeValue(code);this.change(code);this.touch();}
}
