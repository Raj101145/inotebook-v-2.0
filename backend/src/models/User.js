const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
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
      select: false, // don't return password in queries
      minlength: 6,
    },
  },
  { timestamps: true }
);


// 🔐 Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
  this.password = await bcrypt.hash(this.password, saltRounds);
});


// 🔍 Compare password during login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(String(candidatePassword), this.password);
};


module.exports = mongoose.model('User', userSchema);