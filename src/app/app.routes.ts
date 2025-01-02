import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AddFormComponent } from './pages/add-form/add-form.component';
import { FormListComponent } from './pages/form-list/form-list.component';

export const routes: Routes = [

    { path: '', component:HomeComponent, pathMatch: 'full' },
    { path: 'add-form', component:AddFormComponent, },
    { path: 'edit-form/:id', component:AddFormComponent, },
    { path: 'user-list', component:FormListComponent, },
];
