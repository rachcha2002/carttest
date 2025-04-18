const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    phoneNumber: { type: String, required: true },
    role: {
      type: String,
      enum: ["customer", "restaurant", "delivery", "admin"],
      default: "customer",
    },
    address: {
      type: String,
    },
    profilePicture: { type: String },
    restaurantInfo: {
      restaurantName: String,
      description: { type: String, trim: true },
      cuisine: [String],
      businessHours: { open: String, close: String },
      location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: [0, 0] },
      },
      images: [
        {
          url: String,
          description: String,
          isPrimary: { type: Boolean, default: false },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
    },
    defaultLocations: [
      {
        name: String,
        address: {
          street: String,
          city: String,
          state: String,
          postalCode: String,
          country: String,
        },
        location: {
          type: { type: String, enum: ["Point"], default: "Point" },
          coordinates: { type: [Number], default: [0, 0] },
        },
        isDefault: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    deliveryInfo: {
      vehicleType: String,
      vehicleNumber: String,
      licenseNumber: String,
      availabilityStatus: {
        type: String,
        enum: ["online", "offline"],
        default: "offline",
      },
      currentLocation: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: [0, 0] },
      },
      documents: {
        driverLicense: {
          url: String,
          verified: { type: Boolean, default: false },
          uploadedAt: { type: Date },
        },
        vehicleRegistration: {
          url: String,
          verified: { type: Boolean, default: false },
          uploadedAt: { type: Date },
        },
        insurance: {
          url: String,
          verified: { type: Boolean, default: false },
          uploadedAt: { type: Date },
        },
      },
    },
    isVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
userSchema.index({ "restaurantInfo.location": "2dsphere" });
userSchema.index({ "deliveryInfo.currentLocation": "2dsphere" });
userSchema.index({ "defaultLocations.location": "2dsphere" });
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};
const User = mongoose.model("User", userSchema);
module.exports = User;
