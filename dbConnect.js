const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    await mongoose.connect(Bun.env.MONGO_URI);
  } catch (err) {
    console.error(err);
  }
};

module.exports = dbConnect;
