import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import pTimeout from "p-timeout";

import { FetchedMinerState } from "../../../types";
import { apiResponseTimeoutMilliseconds } from "../../../constants";

export type MinerState = {
  container:
    | {
        id: string;
        status: "running" | "paused";
      }
    | null
    | {
        status: "fetchError";
        errorMessage: string;
      };
};

export type RestoreMinerState = NonNullable<MinerState["container"]>;

const initialState: MinerState = {
  container: null,
};

export const fetchMinerStatus = createAsyncThunk(
  "miner/fetchMinerStatus",
  async (): Promise<FetchedMinerState> => {
    if (window.minerService) {
      return pTimeout(window.minerService.inspectMiner(), {
        milliseconds: apiResponseTimeoutMilliseconds,
      });
    } else {
      throw new Error("MinerService API not installed");
    }
  }
);

const slice = createSlice({
  name: "miner",
  initialState,
  reducers: {
    restore: (state, action: PayloadAction<RestoreMinerState>) => {
      state.container = action.payload;
    },

    stop: (state) => {
      if (state.container) {
        state.container.status = "paused";
      } else {
        throw new Error("Inconsisted state. Container doesn't exists");
      }
    },

    start: (state) => {
      if (state.container) {
        state.container.status = "running";
      } else {
        throw new Error("Inconsisted state. Container doesn't exists");
      }
    },

    install: (state, action: PayloadAction<string>) => {
      if (!state.container) {
        state.container = {
          id: action.payload,
          status: "paused",
        };
      } else {
        throw new Error("Inconsisted state. Container alredy exists");
      }
    },

    installError: (state, action: PayloadAction<string>) => {
      state.container = {
        status: "fetchError",
        errorMessage: action.payload,
      };
    },
  },
  extraReducers(builder) {
    builder
      .addCase(
        fetchMinerStatus.fulfilled,
        (state, action: PayloadAction<FetchedMinerState>) => {
          if (action.payload.state === "notExists") {
            state.container = null;
          } else {
            state.container = {
              id: action.payload.id,
              status: action.payload.state,
            };
          }
        }
      )
      .addCase(fetchMinerStatus.rejected, (state, err) => {
        state.container = {
          status: "fetchError",
          errorMessage: err.error.message ?? "Unexpected error",
        };
      });
  },
});

export default slice.reducer;

export const { install, installError, restore, start, stop } = slice.actions;
