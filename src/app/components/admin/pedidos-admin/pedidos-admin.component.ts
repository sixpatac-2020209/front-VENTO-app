import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { OrderRestService } from 'src/app/services/ordersRest/order-rest.service';
import { PedidoModel } from 'src/app/models/pedido.model';
import { ExportExcelPedidoService } from '../../../services/exportData/exportExcelPedido/export-excel-pedido.service';
import { VendedorRestService } from '../../../services/vendedorRest/vendedor-rest.service';
import { VendedorModel } from '../../../models/vendedor.model';
import Swal from 'sweetalert2';

import { FormControl } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
import * as _moment from 'moment';
import { Moment } from 'moment';
// tslint:disable-next-line:no-duplicate-imports

const moment = _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};


/** @title Datepicker emulating a Year and month picker */

@Component({
  selector: 'app-pedidos-admin',
  templateUrl: './pedidos-admin.component.html',
  styleUrls: [
    './pedidos-admin.component.css',
    '../../../../assets/others/assets/scss/style.scss',
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})


export class PedidosAdminComponent implements OnInit {
  pedido: PedidoModel;
  pedidos: any;
  position: any;
  vendedor: VendedorModel;
  pedidosY: any;
  pedidosPorMes: any;

  //Variables - Control de Páginas//
  pageCard = 1;
  pageSizeCard = 6;
  page = 1;
  pageSize = 5;
  collectionSize: any;
  today: any
  sixMonthsAgo: any;
  monthForm: any;

  constructor(
    private pedidoRest: OrderRestService,
    private vendedorRest: VendedorRestService,
    private excelService: ExportExcelPedidoService,
  ) {
    this.pedido = new PedidoModel('', '', '', '', '', '', '', '', '');
    this.vendedor = new VendedorModel('', '', '');
  }

  ngOnInit(): void {
    this.getPedidos();
  }

  date = new FormControl(moment());

  chosenYearHandler(normalizedYear: Moment) {
    const ctrlValue = this.date.value;
    if (ctrlValue !== null) {
      ctrlValue.year(normalizedYear.year());
      this.date.setValue(ctrlValue);
    }
  }

  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.date.value;
    if (ctrlValue !== null) {
      ctrlValue.month(normalizedMonth.month());
      this.date.setValue(ctrlValue);
      this.getPedidosPorMes(this.monthForm);
      datepicker.close();
    }
  }

  //Variables - Mostrar | Ocultar DOM//
  showTableUsers: boolean = false;
  notFound: boolean = false;

  //Botones de Acciones//
  buttonActions: boolean = false;
  controloClick: number = 0;

  getPedidos() {
    this.pedidoRest.getPedidos().subscribe({
      next: (res: any) => {
        this.pedidos = res.returnPedidos;
        this.collectionSize = this.pedidos.length;
        for (let pedido of this.pedidos) {
          pedido.position = this.pedidos.indexOf(pedido) + 1;
        }
        if (this.showTableUsers === true) {
          for (let pedido of this.pedidos) {
            pedido.checked = true;
          }
          this.pedidos = this.pedidos
            .map((pedido: any, i: number) => ({ id: i + 1, ...pedido }))
            .slice(
              (this.page - 1) * this.pageSize,
              (this.page - 1) * this.pageSize + this.pageSize
            );
        }
      },
      error: (err) => console.log(err),
    });
  }

  getPedido(id: string) {
    this.pedidoRest.getPedido(id).subscribe({
      next: (res: any) => {
        this.pedido = res.returnPedido;
        console.log(this.pedido);
      },
      error: (err) => {
        alert(err.error.message);
      },
    });
    this.vendedorRest.getVendedorPedido(id).subscribe({
      next: (res: any) => {
        this.vendedor = res.returnVendedor;
        console.log(this.vendedor.CORREOE);
      },
      error: (err) => {
        alert(err.error.message);
      },
    });
  }

  getVendedorPedido(id: string) {
    this.vendedorRest.getVendedorPedido(id).subscribe({
      next: (res: any) => {
        this.vendedor = res.returnPedido;
        console.log(this.vendedor.CORREOE);
      },
      error: (err) => {
        alert(err.error.message);
      },
    });
  }

  //Exportar Datos a Excel//
  exportExcel() {
    this.excelService.downloadExcel(this.pedidos);
  }

  //VARIABLES DE CONTROL DE FILTRO//
  filtros: boolean = false;
  yearFiltro: boolean = false;
  monthFiltro: boolean = false;

  showFilters() {
    this.filtros = !this.filtros;
  }

  showYearFilter() {
    this.yearFiltro = !this.yearFiltro;
    this.monthFiltro = false;
  }

  showMonthFilter() {
    this.monthFiltro = !this.monthFiltro;
    this.yearFiltro = false;
  }

  cleanFilters() {
    this.monthFiltro = false;
    this.yearFiltro = false;
  }

  getPedidosPorA(yearForm: any) {
    this.pedidoRest.getPedidoPorA(this.pedido).subscribe({
      next: (res: any) => {
        this.pedidosY = res.returnPedidosPorYear;
        if (this.pedidosY.length === 0 || this.pedidosPorMes === null || this.pedidosPorMes === undefined) {
          this.notFound = !this.notFound
        }
        console.log(this.pedidosY);
      },
      error: (err: any) => {
        Swal.fire({
          icon: 'error',
          title: err.error.message || err.error,
          confirmButtonColor: '#E74C3C'
        });
        yearForm.reset();
      },
    });
    yearForm.reset();
  }

  getPedidosPorMes(monthForm: any) {
    this.pedidoRest.getPedidoPorMes(this.pedido).subscribe({
      next: (res: any) => {
        this.pedidosPorMes = res.returnPedidosPorMes;
        if (this.pedidosPorMes.length === 0) {
          this.notFound = !this.notFound;
        };
        monthForm.reset();
      },
      error: (err: any) => {
        Swal.fire({
          icon: 'error',
          title: err.error.message || err.error,
          confirmButtonColor: '#E74C3C'
        });
        monthForm.reset();
      },
    });
    monthForm.reset();
  }

  //tablas de filtros
  yearTable: boolean = false
  monthTable: boolean = false
  principalTable: boolean = false

  showTableYear() {
    this.yearTable = !this.yearTable;
    this.monthTable = false;
    this.principalTable = !this.principalTable;
  }

  showTableMonth() {
    this.monthTable = !this.monthTable;
    this.yearTable = false;
    this.principalTable = !this.principalTable;
  }

  showPrincipalTable() {
    this.principalTable = !this.principalTable;
    this.yearTable = false;
    this.monthTable = false;
  }

}

