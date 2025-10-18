
import mongoose from "mongoose";
import bcrypt from 'bcrypt';
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  phone: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["mine manager", "general user"],
    default: "general user",
  },

  
  mineName: {
    type: String,
    default: null,
  },

  mineLocation: {
    type: String,
    default: null,
  },

    mineid: { type: mongoose.Schema.Types.ObjectId, 
      ref: "Mineemission", 
      default: null ,

    },
});


userSchema.pre("save", async function (next) {
  const user = this;

  
  if (!user.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10); 
    user.password = await bcrypt.hash(user.password, salt); 
    next();
  } catch (err) {
    console.log(err);
    next(err);
  }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
