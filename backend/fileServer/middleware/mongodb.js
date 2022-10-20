const {MongoClient, GridFSBucket} = require("mongodb")
const mongodb = async (req, res, next) => {
    const {db, collection, bulk, ...extras} = req.query
    const mongoClient = new MongoClient(process.env.DATABASE_URI)
    req.conn = await mongoClient.connect()
    req.mongoDb = req.conn.db(db ? db : "defaultDb")
    req.collection = req.mongoDb.collection(collection ? collection : "defaultCollection")
    req.bucket = new GridFSBucket(req.mongoDb, {bucketName: bulk ? bulk : "defaultBulk"});
    req.query = extras
    next();
}
module.exports = mongodb