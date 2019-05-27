import React, { Fragment /*, useEffect*/ } from 'react'
import PropTypes from 'prop-types'
//import { getProfileById } from '../../actions/profile'
import { likePost, unlikePost, deletePost } from '../../actions/post'
import { Link } from 'react-router-dom'
import Moment from 'react-moment'
import { connect } from 'react-redux'



const PostItem = ({ deletePost, likePost, unlikePost, auth, post: { _id, user, text, name, likes, comments, avatar, date }, profile }) => {

    /*
        useEffect(() => {
            getProfileById(user._id)
        }, [getProfileById])
        */

    return <div className="post bg-white p-1 my-1">
        <div>
            <Link to={`/profile/${user}`}>
                <img
                    className="round-img"
                    src={avatar}
                    alt=""
                />
                <h4>{name}</h4>
            </Link>
        </div>
        <div>
            <p className="my-1">
                {text}
            </p>
            <p className="post-date">
                Posted on <Moment format='YYYY/MM/DD'>{date}</Moment>
            </p>
            <button onClick={e => likePost(_id)} type="button" className="btn btn-light">
                <i className="fas fa-thumbs-up"></i>
                <span> {likes.length > 0 && likes.length}</span>
            </button>
            <button onClick={e =>
                unlikePost(_id)
            } type="button" className="btn btn-light">
                <i className="fas fa-thumbs-down"></i>
            </button>
            <Link to={`/post/${_id}`} className="btn btn-primary">
                Discussion {comments.length > 0 && <span className='comment-count'>{comments.length}</span>}

            </Link>
            {!auth.loading && auth.user._id === user &&
                <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => deletePost(_id)}>
                    <i className="fas fa-times"></i>
                </button>}
        </div>
    </div>


}

PostItem.propTypes = {
    //   getProfileById: PropTypes.func.isRequired,
    post: PropTypes.object.isRequired,
    auth: PropTypes.object.isRequired,
    likePost: PropTypes.func.isRequired,
    unlikePost: PropTypes.func.isRequired,
    deletePost: PropTypes.func.isRequired
}
const mapStateToProps = state => ({
    auth: state.auth
})

export default connect(mapStateToProps, { /*getProfileById, */ likePost, unlikePost, deletePost })(PostItem)
