import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupsComponent } from "../../components/groups/groups.component";
import {MatGridListModule} from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { PeopleComponent } from '../../components/people/people.component';

@Component({
    selector: 'rs-main',
    standalone: true,
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
    imports: [
        CommonModule, 
        GroupsComponent, 
        MatGridListModule, 
        PeopleComponent
    ]
})
export class MainComponent {

}
