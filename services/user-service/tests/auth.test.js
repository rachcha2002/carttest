const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/server");
const User = require("../src/models/User");

// Mock data
const testUser = {
  name: "Test User",
  email: "test@example.com",
  password: "password123",
  phoneNumber: "1234567890",
  role: "customer",
};

// Before all tests, connect to test database if not connected
beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
});

// After all tests, close connection and clean up
afterAll(async () => {
  // Clean up test data
  await User.deleteMany({ email: testUser.email });

  // Close mongoose connection
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

describe("Auth Controller", () => {
  let authToken;

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/api/auth/register").send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toHaveProperty("_id");
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user).not.toHaveProperty("password");
    });

    it("should not register a user with existing email", async () => {
      const res = await request(app).post("/api/auth/register").send(testUser);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "Email already in use");
    });

    it("should validate registration input", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Te",
        email: "invalid-email",
        password: "123",
        phoneNumber: "123",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("errors");
      expect(res.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login a user with valid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toHaveProperty("_id");
      expect(res.body.user.email).toBe(testUser.email);

      // Save token for future tests
      authToken = res.body.token;
    });

    it("should not login with invalid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: "wrongpassword",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Invalid credentials");
    });
  });

  describe("GET /api/auth/me", () => {
    it("should get current user profile with valid token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("user");
      expect(res.body.user.email).toBe(testUser.email);
    });

    it("should reject request without token", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Authentication required");
    });
  });

  describe("POST /api/auth/change-password", () => {
    it("should change password with correct current password", async () => {
      const res = await request(app)
        .post("/api/auth/change-password")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: "newpassword123",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty(
        "message",
        "Password changed successfully"
      );

      // Update test user password for further tests
      testUser.password = "newpassword123";
    });

    it("should not change password with incorrect current password", async () => {
      const res = await request(app)
        .post("/api/auth/change-password")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          currentPassword: "wrongpassword",
          newPassword: "anotherpassword123",
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty(
        "message",
        "Current password is incorrect"
      );
    });
  });
});
