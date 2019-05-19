import axios from 'axios'
import { setAlert } from './alert'
import {
    GET_PROFILE,
    GET_PROFILES,
    GET_REPOS,
    PROFILE_ERROR,
    UPDATE_PROFILE,
    CLEAR_PROFILE,
    ACCOUNT_DELETED,
} from './types'

// get current user profile
export const getCurrentProfile = () => async dispatch => {
    try {
        const res = await axios.get('/api/profile/me')

        dispatch({
            type: GET_PROFILE,
            payload: res.data
        })
    } catch (err) {

        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        })
    }
}

// Get all profiles
export const getProfiles = () => async dispatch => {
    dispatch({
        type: CLEAR_PROFILE
    })

    try {
        const res = await axios.get('/api/profile')

        dispatch({
            type: GET_PROFILES,
            payload: res.data
        })
    } catch (err) {

        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        })
    }
}


// Get Profile by ID
export const getProfileById = userId => async dispatch => {

    try {
        const res = await axios.get(`/api/profile/user/${userId}`)

        dispatch({
            type: GET_PROFILE,
            payload: res.data
        })
    } catch (err) {

        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        })
    }
}



// Get Github Repos of profile
export const getGithubRepos = username => async dispatch => {

    try {
        const res = await axios.get(`/api/profile/github/${username}`)

        dispatch({
            type: GET_REPOS,
            payload: res.data
        })
    } catch (err) {

        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        })
    }
}



// Create or update a profile
export const createProfile = (formData, history, edit = false) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }
        const res = await axios.post('/api/profile', formData, config)
        dispatch({
            type: GET_PROFILE,
            payload: res.data
        })
        dispatch(setAlert(edit ? 'Profile updated' : 'Profile created', 'success'))

        // <Redirect..> does not work in an action
        if (!edit) {
            history.push('/dashboard')
        }
    } catch (err) {
        const errors = err.response.data.errors

        if (errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')))
        }

        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        })
    }
}

// Add Experience
export const addExperience = (formData, history) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }
        const res = await axios.put('/api/profile/experience', formData, config)
        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        })
        dispatch(setAlert('Experience added', 'success'))

        // <Redirect..> does not work in an action
        history.push('/dashboard')

    } catch (err) {
        const errors = err.response.data.errors

        if (errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')))
        }

        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        })
    }
}

// Add Education
export const addEducation = (formData, history) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }
        const res = await axios.put('/api/profile/education', formData, config)
        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        })
        dispatch(setAlert('Education added', 'success'))

        // <Redirect..> does not work in an action
        history.push('/dashboard')

    } catch (err) {
        const errors = err.response.data.errors

        if (errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')))
        }

        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        })
    }
}

// delete experience
export const deleteExperience = (id) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }
        const res = await axios.delete(`/api/profile/experience/${id}`)
        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        })
        dispatch(setAlert('Experience removed', 'success'))



    } catch (err) {
        const errors = err.response.data.errors

        if (errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')))
        }

        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        })
    }
}

// delete education
export const deleteEducation = (id) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }
        const res = await axios.delete(`/api/profile/education/${id}`)
        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        })
        dispatch(setAlert('Education removed', 'success'))



    } catch (err) {
        const errors = err.response.data.errors

        if (errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')))
        }

        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        })
    }
}

// Delete Account and profile
export const deleteAccount = () => async dispatch => {
    if (window.confirm('Are you sure? This can not be undone!')) {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            const res = await axios.delete(`/api/profile/`)
            dispatch({
                type: CLEAR_PROFILE,
            })
            dispatch({
                type: ACCOUNT_DELETED,
            })
            dispatch(setAlert('Your Account has been permanently deleted.'))

        } catch (err) {
            const errors = err.response.data.errors

            dispatch({
                type: PROFILE_ERROR,
                payload: { msg: err.response.statusText, status: err.response.status }
            })
        }
    }

}