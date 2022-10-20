const fs = require("fs");
const multiparty = require('multiparty');
const status = require('http-status')
const {ObjectId} = require("mongodb");
const {v4} = require("uuid")
const upload = async (req, res) => {
    let form = new multiparty.Form();
    form.parse(req, (err, metas, files) => {
        if (err) {
            res.status(status.UNPROCESSABLE_ENTITY).json(err)
        }
        const infos = {}
        let count = 0
        let currentCount = 0
        Object.entries(files).forEach(([fileType, file]) => {
            count += file.length
        })
        Object.entries(files).map(([fileType, file]) => {
            infos[fileType] = []
            file.map((f, index) => {
                let tempFile = f.path
                let origName = f.originalFilename
                let writeStream = req.bucket.openUploadStream(origName, {
                    chunkSizeBytes: 1048576,
                    metadata: {fileType}
                })
                fs.createReadStream(tempFile)
                    .on('end', function () {
                        infos[fileType].push({msg: `File received!`, _id: writeStream.id})
                        currentCount += 1
                        if (currentCount === count) {
                            res.json(infos)
                        }
                    })
                    .on('error', function () {
                        infos[fileType].push({msg: 'Error'})
                        currentCount += 1
                        if (currentCount === count) {
                            res.json(infos)
                        }
                    })
                    .pipe(writeStream);
            })
        })
    });
}
const download = (req, res) => {
    res.setHeader('Content-disposition', v4());
    req.bucket.openDownloadStream(ObjectId(req.params._id)).pipe(res);
}
const delFile = (req, res) => {
    req.bucket.delete(ObjectId(req.params._id),()=>{
        res.json({msg:"删除成功"})
    })
}
module.exports = {
    upload,
    download,
    delFile
}