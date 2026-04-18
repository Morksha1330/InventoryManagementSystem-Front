import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Login } from './features/login/login';
import { Createuser } from './features/createuser/createuser';
import { HttpClientModule } from '@angular/common/http';
import { Dashboard } from './features/dashboard/dashboard';
import { UserList } from './features/user-list/user-list';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('InventoryMgtSystem');
}
