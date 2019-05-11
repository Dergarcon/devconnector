const express = require('express')
const router = express.Router()
const {
    check,
    validationResult
} = require('express-validator/check')
const auth = require('../../middleware/auth')

const Post = require('../../models/Post')
const Profile = require('../../models/Profile')
const User = require('../../models/User')

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post('/', [auth,
    check('text', 'Text is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }

    try {
        const user = await User.findById(req.user.id).select('-password')

        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        })

        const post = await newPost.save()
        res.json(post)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }


})


// @route   GET api/posts
// @desc    GET all posts
// @access  Private

router.get('/', auth, async (req, res) => {
    try { // -1 shows newest post first
        const posts = await Post.find().sort({
            date: -1
        })
        res.json(posts)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }
})


// @route   GET api/posts/:id
// @desc    GET post by id
// @access  Private

router.get('/:id', auth, async (req, res) => {
    try { // -1 shows newest post first
        const post = await Post.findById(req.params.id)
        if (!post) {
            return res.status(404).json({
                msg: 'Post not found'
            })
        }
        res.json(post)
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                msg: 'Post not found'
            })
        }
        console.error(error.message)
        res.status(500).send('Server error')
    }
})


// @route   DELETE api/posts:id
// @desc    Delete a post by id
// @access  Private

router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        if (!post) {
            return res.status(404).json({
                msg: 'Post not found'
            })
        }

        //Check user
        if (post.user.toString() != req.user.id) {
            return res.status(401).json({
                msg: 'User not authorized'
            })
        }
        await post.remove()

        res.json({
            msg: 'Post deleted'
        })
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                msg: 'Post not found'
            })
        }
        console.error(error.message)
        res.status(500).send('Server error')
    }
})

// @route   PUT api/posts/like/:id
// @desc    Like a post
// @access  Private

router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        //check if post has already been liked (by this user)
        //the funciton in filter returns something if the user has already liked
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({
                msg: "Post already liked"
            })
        }

        post.likes.unshift({
            user: req.user.id
        })
        await post.save()

        res.json(post.likes)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }
})


// @route   PUT api/posts/unlike/:id
// @desc    Unlike a post (not disklike)
// @access  Private

router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        //check if post has already been liked (by this user)
        //the funciton in filter returns something if the user has already liked
        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({
                msg: "Post has not yet been liked"
            })
        }

        // Get remove index
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id)
        post.likes.splice(removeIndex, 1)

        await post.save()

        res.json(post.likes)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }
})

module.exports = router