import { createReducer, on } from "@ngrx/store"
import { addProfileData, loginUser, logoutUser } from "./action"
import { AppState, User } from "src/app/login/login.model"

const initialState: {connections: AppState} = {
    connections: {
        user: getStateFromLocalStorage()
    }
}

export const connectionsReducer = createReducer(
    initialState,

    on(loginUser, (state, payload) => {
        return { ...state, 
            connections: {
                user: {...payload.user, loggedIn: true}
            }
        }
    }),

    on(logoutUser, () => {
        return { ...initialState }
    }),

    on(addProfileData, (state, payload) => {
        return { ...state, 
            connections: {
                user: {
                    ...state.connections.user, 
                    name: payload.name 
                }
            }
        }
    })

)

function getStateFromLocalStorage(): User {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        return JSON.parse(userStr);
    } else {
        return {
            loggedIn: false,
            name: '',
            email: '',
            uid: '',
            token: '',
            password: ''
        } as User;
    }
}