const status = require('http-status')
const {flatten} = require('mongo-dot-notation')
const {MongoClient, GridFSBucket} = require("mongodb")


class DB {
    // 接收req
    constructor({query: {dbName, collectionName, bucketName, ...extras}}) {
        this.dbName = dbName
        this.collectionName = collectionName
        this.bucketName = bucketName
        this.query = extras
    }

    async connect() {
        const mongoClient = new MongoClient(process.env.DATABASE_URI)
        const conn = await mongoClient.connect()
        const mongoDb = conn.db(this.dbName ? this.dbName : "defaultDb")
        const collection = mongoDb.collection(this.collectionName ? this.collectionName : "defaultCollection")
        const bucket = new GridFSBucket(mongoDb, {bucketName: this.bucketName ? this.bucketName : "defaultBuck"});
        return {conn, collection, bucket}
    }

    async getItems() {
        let {limit, skip, ...extraQuery} = this.query
        const {conn, collection} = await this.connect()
        limit = limit ? Number(limit) : 10
        skip = skip ? Number(skip) : 0
        const cur = collection.find(extraQuery).skip(skip).limit(limit)
        const data = await cur.toArray()
        const count = await collection.countDocuments()
        await conn.close()
        return {data, count, skip, limit}
    }

    async queryItems(body = {}) {
        let {limit, skip} = this.query
        const {conn, collection} = await this.connect()
        limit = limit ? Number(limit) : 10
        skip = skip ? Number(skip) : 0
        const cur = collection.find(body)
        const count = await collection.countDocuments(body)
        const page = cur.skip(skip).limit(limit)
        const data = await page.toArray()
        await conn.close()
        return {data, count, skip, limit}
    }

    async addItems(body = {}) {
        const {conn, collection} = await this.connect()
        try {
            if (body instanceof Array) {
                const info = await collection.insertMany(body)
                await conn.close()
                return info
            }
            if (Object.prototype.toString.call(body) === "[object Object]") {
                return collection.insertOne(body)
            }
        } catch (e) {
            return Promise.reject({
                msg: e.toString()
            })
        }
        return Promise.reject({
            errMsg: "参数格式不正确"
        })

    }

    async modifyItems(body = {}) {
        const {conn, collection} = await this.connect()
        const updateOne = async ({_id, ...extras}) => {
            return collection.updateMany({_id}, flatten(extras))
        }
        if (body instanceof Array) {
            const info = body.map(item => updateOne(item))
            return Promise.all(info)
        }
        if (Object.prototype.toString.call(body) === "[object Object]") {
            return updateOne(body)
        }
        return Promise.reject({
            errMsg: "参数格式不正确"
        })
    }

    async deleteItems(body = {}) {
        const {conn, collection} = await this.connect()
        if (body instanceof Array) {
            const info = body.map(async item => {
                return await collection.deleteMany({_id: item._id})
            })
            return Promise.all(info)
        }
        if (Object.prototype.toString.call(body) === "[object Object]") {
            return collection.deleteMany({_id: body._id})
        }
        return Promise.reject({
            errMsg: "参数格式不正确"
        })
    }
}

module.exports = {
    DB
}