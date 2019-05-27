import axios from 'axios'
import { setAlert } from './alert'
import {
    GET_POSTS, POST_ERROR, UPDATE_LIKES, UPDATE_POSTS, DELETE_POST, ADD_POST
} from './types'

//get posts
export const getPosts = () => async dispatch => {
    try {
        const res = await axios.get('/api/posts')

        dispatch({
            type: GET_POSTS,
            payload: res.data
        })

    } catch (err) {

        dispatch({
            type: POST_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        })
    }

}


//create a post
export const addPost = (formData) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }


        const res = await axios.post('/api/posts', formData, config)


        dispatch({
            type: ADD_POST,
            payload: res.data
        })

        dispatch(setAlert("Post created", 'success'))
    } catch (err) {

        const errors = err.response.data.errors

        if (errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')))
        }

        dispatch({
            type: POST_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        })
    }

}



//like a post
export const likePost = postId => async dispatch => {
    try {
        const res = await axios.put(`/api/posts/like/${postId}`)

        dispatch({
            type: UPDATE_LIKES,
            payload: { postId, likes: res.data }
        })


    } catch (err) {

        dispatch({
            type: POST_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        })
    }

}



//unlike a post
export const unlikePost = postId => async dispatch => {
    try {
        const res = await axios.put(`/api/posts/unlike/${postId}`)

        dispatch({
            type: UPDATE_LIKES,
            payload: { postId, likes: res.data }
        })

    } catch (err) {

        dispatch({
            type: POST_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        })
    }

}


//delete a post
export const deletePost = postId => async dispatch => {
    try {
        const res = await axios.delete(`/api/posts/${postId}`)


        dispatch({
            type: DELETE_POST,
            payload: postId
        })

        dispatch(setAlert(res.data.msg, 'success'))
    } catch (err) {

        dispatch({
            type: POST_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        })
    }

}
