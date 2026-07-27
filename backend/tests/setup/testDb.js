const { MongoMemoryReplSet } = require("mongodb-memory-server");
const mongoose = require("mongoose");

// A replica set, not a standalone server — transactions (used in
// order.service.js) only work against a replica set, even an in-memory one.
let replSet;

const connect = async () => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replSet.getUri();
  await mongoose.connect(uri);
};

const closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await replSet.stop();
};

const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

module.exports = { connect, closeDatabase, clearDatabase };
