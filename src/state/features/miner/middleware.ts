import {
  addListener,
  createListenerMiddleware,
  TypedStartListening,
  TypedAddListener,
} from "@reduxjs/toolkit";
import { start, stop } from ".";
import type { AppDispatch, RootState } from "../../store";

export const minerCallbacksListenerMiddleware = createListenerMiddleware();

type AppStartListening = TypedStartListening<RootState, AppDispatch>;

export const startAppListening =
  minerCallbacksListenerMiddleware.startListening as AppStartListening;

export const addAppListener = addListener as TypedAddListener<
  RootState,
  AppDispatch
>;

startAppListening({
  predicate: (action, currentState) => {
    return (
      currentState.miner.container !== null &&
      currentState.miner.container.status !== "fetchError"
    );
  },
  effect(action, { dispatch }) {
    if (window.minerService) {
      window.minerService.onMinerStart(() => dispatch(start()));
      window.minerService.onMinerStop(() => dispatch(stop()));
    } else {
      throw new Error("MinerService API not installed");
    }
  },
});
