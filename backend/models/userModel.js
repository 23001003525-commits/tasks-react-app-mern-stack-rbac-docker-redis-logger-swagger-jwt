import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, //Do not return password by default
    },
//String enum is more scalable. Boolean does not scale to: moderator, support, superadmin, manager, etc
    role: {
      type: String,
      required: true,
      enum: ['user', 'admin', 'superadmin'],
      default: 'user',  //ensures new users aren’t admin
      index: true,
    },
// can be used for Soft delete, better than deleting users permanently.
    isSuspended: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  //console.log("matching", enteredPassword, this.password)
  return bcrypt.compare(enteredPassword, this.password);
};

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
