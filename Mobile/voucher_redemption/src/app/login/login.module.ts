import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginPageRoutingModule } from './login-routing.module';

import { LoginPage } from './login.page';
import { SigninComponent } from '../components/signin/signin.component';
import { VerificationComponent} from '../components/verification/verification.component';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginPageRoutingModule,
     FormsModule,
    ReactiveFormsModule
  ],
  declarations: [LoginPage,SigninComponent,VerificationComponent]
})
export class LoginPageModule {}
