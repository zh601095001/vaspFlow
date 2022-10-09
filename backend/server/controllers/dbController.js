const status = require('http-status')

const getItems = async (req, res) => {
	const {limit, skip, ...extraQuery} = req.query
	const filter = {}
	Object.entries(extraQuery).forEach(q => {
		if (q[0].startsWith("min_")) {
			const key = q[0].slice(4)
			filter[key] = {$lt: Number(q[1])}
		} else if (q[0].startsWith("max_")) {
			const key = q[0].slice(4)
			filter[key] = {$gte: Number(q[1])}
		} else {
			const v = q[1]
			filter.$or = [
				{
					[q[0]]: {$regex: new RegExp(`${v}`)}
				},
				{
					[q[0]]: parseInt(v)
				}
			]
		}
	})
	const cur = req.collection.find(filter).skip(skip ? Number(skip) : 0).limit(limit ? Number(limit) : 10)
	const data = await cur.toArray()
	res.json(data)
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
	}
}
const modifyItems = async (req, res) => {
	const {idName} = req.query
	const info = req.body.map(async item => {
		const identify = idName ? idName : "id"
		return await req.collection.updateMany({[identify]: item[identify]}, {
			$set: item
		})
	})
	res.json(await Promise.all(info))
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


