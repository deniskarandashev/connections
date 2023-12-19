import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/components/login/login.component';
import { RegistrationComponent } from './login/components/registration/registration.component';
import { ProfileComponent } from './login/components/profile/profile.component';
import { MainComponent } from './connections/pages/main/main.component';
import { SpecificGroupComponent } from './connections/components/groups/specific-group/specific-group.component';
import { PageNotFoundComponent } from './shared/pages/page-not-found/page-not-found.component';
import { ConversationComponent } from './connections/components/people/conversation/conversation.component';
import { AuthGuard } from './login/services/auth.guard';

const routes: Routes = [
  {
    path: "signup",
    component: RegistrationComponent,
  },
  {
    path: "signin",
    component: LoginComponent,
  },
  {
    path: "profile",
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "",
    component: MainComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "group/:groupID",
    component: SpecificGroupComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "conversation/:conversationID",
    component: ConversationComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
