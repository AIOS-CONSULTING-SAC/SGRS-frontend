import { Component } from '@angular/core'; 

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [],
    template: ` 
       
    `
})
export class Login {
    email: string = '';

    password: string = '';

    checked: boolean = false;
}
