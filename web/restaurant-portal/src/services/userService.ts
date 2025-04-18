import axios from "axios";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phoneNumber: string;
  address: string;
  isVerified: boolean;
  status: string;
  restaurantInfo?: {
    restaurantName: string;
    description: string;
    cuisine: string[];
    businessHours: {
      open: string;
      close: string;
    };
    location: {
      type: string;
      coordinates: [number, number];
    };
    images: Array<{
      url: string;
      description: string;
      isPrimary?: boolean;
      _id: string;
      uploadedAt: string;
    }>;
  };
  deliveryInfo?: {
    currentLocation: {
      type: string;
      coordinates: [number, number];
    };
    availabilityStatus: string;
  };
  defaultLocations?: any[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: string;
  address: string;
  restaurantInfo: {
    restaurantName: string;
    cuisine: string[];
    description: string;
    businessHours: {
      open: string;
      close: string;
    };
    images: ImageInfo[];
    location: {
      type: "Point";
      coordinates: [number, number];
    };
  };
}

export interface ImageInfo {
  url: string;
  description: string;
  isPrimary?: boolean;
}

export class UserService {
  private static instance: UserService;
  private baseUrl =
    process.env.REACT_APP_API_URL || "http://localhost:3001/api";
  private axiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  // Add new subscriber to token refresh
  private onTokenRefreshed(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  // Notify all subscribers that the token has been refreshed
  private notifySubscribersAboutTokenRefresh(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors for token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, wait and retry with new token
            return new Promise((resolve) => {
              this.onTokenRefreshed((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.axiosInstance(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const token = localStorage.getItem("token");
            if (!token) {
              throw new Error("No token found");
            }

            const response = await this.refreshToken(token);
            const newToken = response.token;
            localStorage.setItem("token", newToken);

            // Update the authorization header
            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            // Notify all pending requests that token has been refreshed
            this.notifySubscribersAboutTokenRefresh(newToken);

            this.isRefreshing = false;
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            this.isRefreshing = false;
            localStorage.removeItem("token");

            // Don't automatically redirect - just reject the promise
            // The auth context will handle the redirection
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.axiosInstance.post<LoginResponse>(
      "/auth/login",
      {
        email,
        password,
      }
    );
    return response.data;
  }

  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await this.axiosInstance.post<LoginResponse>(
      "/auth/register",
      data
    );
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    console.log("Making API call to /auth/me");
    try {
      const response = await this.axiosInstance.get<{ user: User }>("/auth/me");
      console.log("API response:", response.data);
      return response.data.user;
    } catch (error) {
      console.error("Error in getCurrentUser:", error);
      throw error;
    }
  }

  async refreshToken(token: string): Promise<{ token: string }> {
    console.log("Attempting to refresh token");
    try {
      const response = await this.axiosInstance.post<{ token: string }>(
        "/auth/refresh-token",
        { token }
      );
      console.log("Token refresh successful");
      return response.data;
    } catch (error) {
      console.error("Token refresh failed, trying fallback:", error);
      // If the refresh token endpoint fails, try a silent fallback to getCurrentUser
      try {
        await this.getCurrentUser();
        console.log("Fallback to getCurrentUser succeeded");
        return { token };
      } catch {
        console.error("Fallback to getCurrentUser also failed");
        throw error;
      }
    }
  }
}

export const userService = UserService.getInstance();
