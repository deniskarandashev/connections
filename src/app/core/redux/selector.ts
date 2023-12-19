import { createSelector } from "@ngrx/store";
import { AppState } from "src/app/login/login.model";

// export const selectCurrentUser = (state: AppState) => state.user;
// connections

export const selectConnections = (state: any) => state.connections;

export const selectCurrentUser = createSelector(
    selectConnections, (connections: any) => connections.user
)
