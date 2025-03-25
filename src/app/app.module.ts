import { NgModule } from '@angular/core';
import { CommonModule, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { ProductService } from './demo/service/product.service';
import { CountryService } from './demo/service/country.service';
import { CustomerService } from './demo/service/customer.service';
import { EventService } from './demo/service/event.service';
import { IconService } from './demo/service/icon.service';
import { NodeService } from './demo/service/node.service';
import { PhotoService } from './demo/service/photo.service';
import { ButtonModule } from 'primeng/button';
import { WelcomeComponent } from './core/pages/welcome/welcome.component';
import { DeclarationComponent } from './core/pages/declaration/declaration.component';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PanelsDemoRoutingModule } from './demo/components/uikit/panels/panelsdemo-routing.module';
import { ToolbarModule } from 'primeng/toolbar';
import { RippleModule } from 'primeng/ripple';
import { SplitButtonModule } from 'primeng/splitbutton';
import { AccordionModule } from 'primeng/accordion';
import { TabViewModule } from 'primeng/tabview';
import { FieldsetModule } from 'primeng/fieldset';
import { MenuModule } from 'primeng/menu';
import { DividerModule } from 'primeng/divider';
import { SplitterModule } from 'primeng/splitter';
import { PanelModule } from 'primeng/panel';
import { ScrollTopModule } from 'primeng/scrolltop';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';

@NgModule({
    declarations: [
        AppComponent, NotfoundComponent,WelcomeComponent,DeclarationComponent
    ],
    imports: [
        AppRoutingModule,
        AppLayoutModule,
        CardModule,
        ButtonModule,
        InputTextModule,
        InputTextareaModule,
        ToastModule,
        TableModule,
        CommonModule,
        FormsModule,
        PanelsDemoRoutingModule,
        ToolbarModule,
        RippleModule,
        SplitButtonModule,
        AccordionModule,
        TabViewModule,
        FieldsetModule,
        MenuModule,
        DividerModule,
        SplitterModule,
        PanelModule,
        ScrollTopModule,



       // Nécessaire pour ngModel
    ReactiveFormsModule, // Nécessaire pour formGroup
    DropdownModule,      // Module pour p-dropdown
    CalendarModule,      // Module pour p-calendar
  
    ],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        CountryService, CustomerService, EventService, IconService, NodeService,
        PhotoService, ProductService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
