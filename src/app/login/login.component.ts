import { Component, OnInit } from '@angular/core';
import { Authorization } from './Authorization.service';
import { Router } from '@angular/router';
import { TouchSequence } from 'selenium-webdriver';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  
 /*TODO - A LOGIN PAGE */ 
  constructor(private auth:Authorization, private router: Router) { }

  ngOnInit() {
    this.auth.test();
    this.router.navigate(['../welcome'], {state: {example: "hello" } });
    
    
  }

  login() {
    
  }

}
