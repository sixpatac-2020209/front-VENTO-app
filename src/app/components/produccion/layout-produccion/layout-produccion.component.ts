import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout-produccion',
  templateUrl: './layout-produccion.component.html',
  styleUrls: ['./layout-produccion.component.css']
})
export class LayoutProduccionComponent implements OnInit {

  constructor(private elementRef: ElementRef,  public  _router: Router) { }

  ngOnInit() {

    var s = document.createElement("script");
    s.type = "text/javascript";
    s.src = "../../../../assets/js/main.js";
    this.elementRef.nativeElement.appendChild(s);
  }

}
