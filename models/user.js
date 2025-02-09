const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog", // Reference to the Blog model
    },
  ],
});

// Hook to hash the password before saving the user
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next(); // only hash password if it's modified
  try {
    const saltRounds = 10; // Salt rounds for bcrypt hashing
    this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare a plain password with the hashed password
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

// Transform the output to include `id` instead of `_id` and exclude `passwordHash`
userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString(); // Convert _id to id
    delete returnedObject._id; // Remove the _id field
    delete returnedObject.passwordHash; // Remove passwordHash from the response
  },
});

module.exports = mongoose.model("User", userSchema);
