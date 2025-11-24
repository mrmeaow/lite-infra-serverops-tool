// Authenticate first

db = db.getSiblingDB("admin");
db.auth(
  process.env.MONGO_INITDB_ROOT_USERNAME || "root",
  process.env.MONGO_INITDB_ROOT_PASSWORD || "pa55w0rd",
);

const config = {
  _id: process.env.MONGO_REPLICA_SET_NAME || "rs0",
  members: [
    { _id: 0, host: "mongo_clstr0:27017" },
    { _id: 1, host: "mongo_clstr1:27017" },
    { _id: 2, host: "mongo_clstr2:27017" },
  ],
};

try {
  const result = rs.initiate(config);
  console.log("✅ Replica set initiated");
  console.log(JSON.stringify(result, null, 2));

  // Wait a bit for election
  sleep(2000);

  console.log("\n📊 Replica Set Status:");
  const status = rs.status();
  console.log(JSON.stringify(status, null, 2));
} catch (e) {
  console.log("⚠️ Replica set already initialized or error:");
  console.log(e);
}
