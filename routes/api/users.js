const express = require('express')
const router = express.Router()

const User = require('../../models/User')
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')

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
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            })
        }

        const {
            name,
            email,
            password
        } = req.body

        try {
            // see if user exists
            let user = await User.findOne({
                email
            })
            if (user) {
                return res.status(400).json({
                    errors: [{
                        msg: 'User already exists.'
                    }]
                })
            }

            // Get users gravatar (is based on his mail)
            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            })

            //Encrypt password using bcrypt
            user = new User({
                name,
                email,
                avatar,
                password
            })
            const salt = await bcrypt.genSalt(10)

            user.password = await bcrypt.hash(password, salt)

            await user.save()

            //Return jsonwebtoken

            res.send('User registered')
        } catch (err) {
            console.error(err.message)
            res.status(500).send('Server error')
        }





    })

module.exports = router