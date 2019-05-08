const express = require('express')
const router = express.Router()
const {
    check,
    validationResult
} = require('express-validator/check')

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post('/', [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid E-Mail').isEmail(),
        check('password', 'Please enter a pw with 6 or more chars.').isLength({
            min: 6
        }),
    ],
    (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            })
        }
        console.log(req.body)
        res.send('User route')
    })

module.exports = router