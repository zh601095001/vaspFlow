const status = require('http-status')
const {flatten} = require('mongo-dot-notation')

const getItems = async (req, res) => {
    let {limit, skip, ...extraQuery} = req.query
    limit = limit ? Number(limit) : 10
    skip = skip ? Number(skip) : 0
    const cur = req.collection.find(extraQuery).skip(skip).limit(limit)
    const data = await cur.toArray()
    const count = await req.collection.countDocuments()
    res.json({data, count, skip, limit})
}
const addItems = async (req, res) => {
    try {
        const data = req.body
        if (data instanceof Array) {
            return res.json(await req.collection.insertMany(data))
        }
        if (Object.prototype.toString.call(data) === "[object Object]") {
            return res.json(await req.collection.insertOne(data))
        }
    } catch (e) {
        return res.status(status.CONFLICT).json({
            msg: e.toString()
        })
    }
    return res.status(status.UNPROCESSABLE_ENTITY).json({
        errMsg: "参数格式不正确"
    })

}
const modifyItems = async (req, res) => {
    const updateOne = async ({_id, ...extras}) => {
        return await req.collection.updateMany({_id}, flatten(extras))
    }
    if (req.body instanceof Array) {
        const info = req.body.map(item => updateOne(item))
        return res.json(await Promise.all(info))
    }
    if (Object.prototype.toString.call(req.body) === "[object Object]") {
        return res.json(await updateOne(req.body))
    }
    return res.status(status.UNPROCESSABLE_ENTITY).json({
        errMsg: "参数格式不正确"
    })
}

const deleteItems = async (req, res) => {
    if (req.body instanceof Array) {
        const info = req.body.map(async item => {
            return await req.collection.deleteMany({_id: item._id})
        })
        return res.json(await Promise.all(info))
    }
    if (Object.prototype.toString.call(req.body) === "[object Object]") {
        return res.json(await req.collection.deleteMany({_id: req.body._id}))
    }
    return res.status(status.UNPROCESSABLE_ENTITY).json({
        errMsg: "参数格式不正确"
    })

}
module.exports = {
    getItems,
    modifyItems,
    deleteItems,
    addItems
}


