const router = require('express').Router()
const { validate } = require('../../middleware/auth_middleware')
const { deleteAccount } = require('./account_controllers')

router.delete('/delete', validate, deleteAccount)

module.exports = router
