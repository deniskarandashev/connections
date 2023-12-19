import { createAction, props } from "@ngrx/store";
import { User } from "src/app/login/login.model";

export const registerNewUser = createAction(
    '[Login] Register new User',
    props<{ user: User }>()
)

export const loginUser = createAction(
    '[Login] Log In',
    props<{ user: User }>()
)

export const logoutUser = createAction(
    '[Login] Log Out',
    props<{ user: User }>()
)

export const addProfileData = createAction(
    '[Login] Log Out',
    props<{ name: string }>()
)