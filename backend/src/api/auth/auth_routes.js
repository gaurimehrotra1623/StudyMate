const {signup, login, logout, refresh} = require('./auth.js')
const router = require('express').Router()

router.post('/signup', signup)
router.post('/login', login)
router.post('/logout', logout)
router.post('/refresh', refresh)

module.exports = router;