const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const {
    check,
    validationResult
} = require('express-validator/check')

const Profile = require('../../models/Profile')
const User = require('../../models/User')
const Post = require('../../models/Post')

const request = require('request')
const config = require('config')



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


function addHttp(input) {
    if (input.indexOf('://') === -1) {
        input = `http://${input}`;
        console.log(`new: ${input}`)
    }
    return input
}

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
        var {
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
        var profileFields = {}
        profileFields.user = req.user.id
        company ? profileFields.company = company : profileFields.company = ''
        website ? profileFields.website = addHttp(website) : profileFields.website = ''
        location ? profileFields.location = location : profileFields.location = ''
        bio ? profileFields.bio = bio : profileFields.bio = ''
        status ? profileFields.status = status : profileFields.status = ''
        githubusername ? profileFields.githubusername = githubusername : profileFields.githubusername = ''
        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim())
        }
        // Build social object
        profileFields.social = {}
        if (youtube) profileFields.social.youtube = addHttp(youtube)
        if (twitter) profileFields.social.twitter = addHttp(twitter)
        if (facebook) profileFields.social.facebook = addHttp(facebook)
        if (linkedin) profileFields.social.linkedin = addHttp(linkedin)
        if (linkedin) profileFields.social.linkedin = addHttp(linkedin)
        if (xing) profileFields.social.xing = addHttp(xing)

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


// @route   GET api/profile
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

        // Remove User Posts
        await Post.deleteMany({ user: req.user.id })

        // Remove profile
        await Profile.findOneAndRemove({
            user: req.user.id
        })
        // Remove user
        await User.findOneAndRemove({
            _id: req.user.id
        })
        res.json({
            msg: "User removed"
        })

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



// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private

router.put('/experience', [auth,
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From Date is required').not().isEmpty(),
    check('location', 'Location is required').not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({
            user: req.user.id
        })
        //unshift() is like push() but pushes the new item to the top
        profile.experience.unshift(newExp)
        await profile.save()
        res.json(profile)

    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})



// @route   DELETE api/profile/experience
// @desc    Remove one experience from profile
// @access  Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        })

        // Get remove index

        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id)

        profile.experience.splice(removeIndex, 1)

        await profile.save()

        res.json(profile)

    } catch (error) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})



// ab hier alleingang

// @route   PUT api/profile/education
// @desc    Add profile education
// @access  Private

router.put('/education', [auth,
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('fieldofstudy', 'Field of Study is required').not().isEmpty(),
    check('from', 'From Date is required').not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }

    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body

    const newedu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({
            user: req.user.id
        })
        //unshift() is like push() but pushes the new item to the top
        profile.education.unshift(newedu)
        await profile.save()
        res.json(profile)

    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})



// @route   DELETE api/profile/education
// @desc    Remove one education from profile
// @access  Private

router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        })

        // Get remove index

        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id)

        profile.education.splice(removeIndex, 1)

        await profile.save()

        res.json(profile)

    } catch (error) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})


// @route   GET api/profile/github/:username
// @desc    Get user repos from github
// @access  Public

router.get('/github/:username', (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
            mehtod: 'GET',
            headers: {
                'user-agent': 'node.js'
            }
        }

        request(options, (error, response, body) => {
            if (error) console.error(error)

            if (response.statusCode !== 200) {
                return res.status(404).json({
                    msg: 'No Github profile found'
                })
            }

            res.json(JSON.parse(body))
        })
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})


module.exports = router