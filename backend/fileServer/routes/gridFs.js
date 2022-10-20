const express = require('express');
const router = express.Router();
const dbController = require("../controllers/gridFsController")


router.get("/:_id", dbController.download)
router.post("/", dbController.upload)
// router.put("/", dbController.modifyItems)
router.delete("/:_id", dbController.delFile)
module.exports = router