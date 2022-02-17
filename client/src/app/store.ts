import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import AppReducer from '../AppSlice';
import counterReducer from '../features/counter/counterSlice';
import loginReducer from '../features/login/loginSlice';
import spacesReducer from '../features/spaces/spacesSlice';


export const store = configureStore({
  reducer: {
    app: AppReducer,
    counter: counterReducer,
    login: loginReducer,
    spaces: spacesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['app/setGlobalSocketID', 'login/setGlobalKey', "login/setGlobalAlgorithm"],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['app.socket', 'login.key', 'login.algorithm.iv'],
      },
    }),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
