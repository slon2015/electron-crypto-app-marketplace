import { configureStore } from "@reduxjs/toolkit";

import minerReducer from "./features/miner";
import { minerCallbacksListenerMiddleware } from "./features/miner/middleware";

export const store = configureStore({
  reducer: {
    miner: minerReducer,
  },
  middleware(getDefaultMiddleware) {
    return getDefaultMiddleware().prepend(
      minerCallbacksListenerMiddleware.middleware
    );
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
