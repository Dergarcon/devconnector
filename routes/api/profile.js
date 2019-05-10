const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const {
    check,
    validationResult
} = require('express-validator/check')

const Profile = require('../../models/Profile')
const User = require('../../models/User')


// @route   GET api/profile/me
// @desc    Get current user profile (from token)
// @access  Public
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        }).populate('user', ['name', 'avatar'])

        if (!profile) {
            return res.status(400).json({
                msg: 'There is no profile for this user'
            })
        }

        res.json(profile)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server error')
    }
})

// @route   POST api/profile
// @desc    Create or Update a user profile
// @access  Private

router.post('/',
    [
        auth,
        [
            check('status', 'status is required').not().isEmpty(),
            check('skills', 'skills is required').not().isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            })
        }
        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            instagram,
            twitter,
            linkedin,
            xing
        } = req.body

        // Build Profile Object
        const profileFields = {}
        profileFields.user = req.user.id
        if (company) profileFields.company = company
        if (website) profileFields.website = website
        if (location) profileFields.location = location
        if (bio) profileFields.bio = bio
        if (status) profileFields.status = status
        if (githubusername) profileFields.githubusername = githubusername
        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim())
        }
        // Build social object
        profileFields.social = {}
        if (youtube) profileFields.social.youtube = youtube
        if (twitter) profileFields.social.twitter = twitter
        if (facebook) profileFields.social.facebook = facebook
        if (linkedin) profileFields.social.linkedin = linkedin
        if (linkedin) profileFields.social.linkedin = linkedin
        if (xing) profileFields.social.xing = xing

        try {
            let profile = await Profile.findOne({
                user: req.user.id
            })

            if (profile) {
                //update
                profile = await Profile.findOneAndUpdate({
                    user: req.user.id
                }, {
                    $set: profileFields
                }, {
                    new: true
                })
                return res.json(profile)
            }

            //create
            profile = new Profile(profileFields)
            await profile.save()
            res.json(profile)

        } catch (err) {
            console.error(err.message)
            res.status(500).send('Server error')
        }


    })


// @route   POST api/profile
// @desc    Get all profiles
// @access  Public

router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar'])
        res.json(profiles)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})


// @route   POST api/profile/user/:user_id
// @desc    Get Profile by user ID
// @access  Public

router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.params.user_id
        }).populate('user', ['name', 'avatar'])
        if (!profile) return res.status(400).json({
            msg: 'Profile not found.'
        })
        res.json(profile)
    } catch (err) {
        console.error(err.message)
        if (err.kind == 'ObjectID') {
            return res.status(400).json({
                msg: 'Profile not found.'
            })
        }
        res.status(500).send('Server Error')
    }
})



// @route   DELETE api/profile/
// @desc    Delete profile, user and post
// @access  Private

router.delete('/', auth, async (req, res) => {
    try {
        //@todo remove users posts
        console.log("im try block")
        // Remove profile
        await Profile.findOneAndRemove({
            user: req.user.id
        })
        console.log("profile found and removed")
        // Remove user
        await User.findOneAndRemove({
            _id: req.user.id
        })
        console.log("user found and removed")
        res.json({
            msg: "User removed"
        })

    } catch (err) {
        console.log("im catch block")
        console.error(err.message)
        if (err.kind == 'ObjectID') {
            return res.status(400).json({
                msg: 'Profile not found.'
            })
        }
        res.status(500).send('Server Error')
    }
})



module.exports = router