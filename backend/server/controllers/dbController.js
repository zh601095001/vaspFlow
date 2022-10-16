const status = require('http-status')

const getItems = async (req, res) => {
    let {limit, skip, ...extraQuery} = req.query
    limit = Number(limit)
    skip = Number(skip)
    const cur = req.collection.find(extraQuery).skip(skip ? skip : 0).limit(limit ? limit : 10)
    const data = await cur.toArray()
    const count = await req.collection.countDocuments()
    res.json({data, count, skip, limit})
}
const addItems = async (req, res) => {
    const data = req.body
    if (data instanceof Array) {
        try {
            res.json(await req.collection.insertMany(req.body))
        } catch (e) {
            res.status(status.CONFLICT).json({
                msg: e.toString()
            })
        }
    } else {
        res.status(status.UNPROCESSABLE_ENTITY).json({
            errMsg: "参数格式不正确"
        })
    }
}
const modifyItems = async (req, res) => {
    const {idName} = req.query
    if (!(req.body instanceof Array || req.body instanceof Object)) {
        return res.status(status.UNPROCESSABLE_ENTITY).json({
            errMsg: "参数格式不正确"
        })
    }
    const updateOne = async ({item, idName}) => {
        const identify = idName ? idName : "id"
        return await req.collection.updateMany({[identify]: item[identify]}, {
            $set: item
        })
    }
    const info = req.body.map(item => updateOne({item, idName}))
    return res.json(await Promise.all(info))
}

const deleteItems = async (req, res) => {
    const {idName} = req.query
    const identify = idName ? idName : "id"
    const info = req.body.map(async item => {
        return await req.collection.deleteMany({[identify]: item[identify]})
    })
    res.json(await Promise.all(info))
}
module.exports = {
    getItems,
    modifyItems,
    deleteItems,
    addItems
}


