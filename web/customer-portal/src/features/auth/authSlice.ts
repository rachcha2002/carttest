import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authAPI } from "../../services/api";
import { RootState } from "../../store/store";

interface User {
  id: string;
  email: string;
  name: string;
  addresses: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }) => {
    const response = await authAPI.login(
      credentials.email,
      credentials.password
    );
    localStorage.setItem("token", response.token);
    return { token: response.token, user: response.user };
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (userData: { email: string; password: string; name: string }) => {
    const response = await authAPI.register(userData);
    localStorage.setItem("token", response.token);
    return { token: response.token, user: response.user };
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (userData: Partial<User>) => {
    const response = await authAPI.updateProfile(userData);
    return response.user;
  }
);

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async () => {
    const response = await authAPI.getCurrentUser();
    return response.user;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      // Optionally call the logout API endpoint if needed
      // authAPI.logout().catch(err => console.error('Logout error:', err));

      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Login failed";
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Registration failed";
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;
