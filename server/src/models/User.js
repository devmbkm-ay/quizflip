import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please provide a username'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [30, 'Username must be at most 30 characters long'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Do not return password by default
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    avatar: {
      type: String,
      default:
        'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
    },
    isActive: { type: Boolean, default: false },
    lastLogin: { type: Date },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
    toJSON: {
      transform(doc, ret) {
        delete ret.password; // Remove password from the returned object
        return ret;
      },
    },
  },
);

// Hash password before saving
//We do not use arrow function here because we need access to 'this'
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error); // Pass error to the next middleware
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  //'This.password' is accessible here because we are using a regular function, not an arrow function
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
//Encapsulate JWT generation logic within the user model for better separation of concerns and reusability across the application.
userSchema.methods.getSignedJwtToken = function () {
  const secret = process.env.JWT_SECRET;
  const expire = process.env.JWT_EXPIRE || '1h';
  return jwt.sign(
    { id: this._id, username: this.username, role: this.role },
    secret,
    { expiresIn: expire },
  );
};

const User = mongoose.model('User', userSchema);

export default User;
