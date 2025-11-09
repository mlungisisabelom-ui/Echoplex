import React, { useState } from 'react';
import { authFetch } from '../../api';

export default function CommentSection({ postId, comments, onCommentAdded }) {
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');

    const handleComment = async () => {
        if (!newComment.trim()) return;
        try {
            await authFetch(`/posts/${postId}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: newComment })
            });
            setNewComment('');
            onCommentAdded();
        } catch (e) {
            console.error(e);
        }
    };

    const handleReply = async (commentId) => {
        if (!replyText.trim()) return;
        try {
            await authFetch(`/posts/${postId}/comment/${commentId}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: replyText })
            });
            setReplyText('');
            setReplyingTo(null);
            onCommentAdded();
        } catch (e) {
            console.error(e);
        }
    };

    const handleLikeComment = async (commentId) => {
        try {
            await authFetch(`/posts/${postId}/comment/${commentId}/like`, { method: 'POST' });
            onCommentAdded();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div style={{ marginTop: '10px' }}>
            <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleComment()}
                style={{ width: '100%', padding: '5px' }}
            />
            <button onClick={handleComment}>Comment</button>
            {comments.map(c => (
                <div key={c._id} style={{ marginLeft: '20px', marginTop: '5px' }}>
                    <strong>{c.author.name}</strong>: {c.text}
                    <button onClick={() => handleLikeComment(c._id)}>Like ({c.likes.length})</button>
                    <button onClick={() => setReplyingTo(c._id)}>Reply</button>
                    {replyingTo === c._id && (
                        <div>
                            <input
                                type="text"
                                placeholder="Reply..."
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleReply(c._id)}
                            />
                            <button onClick={() => handleReply(c._id)}>Reply</button>
                        </div>
                    )}
                    {c.replies.map(r => (
                        <div key={r._id} style={{ marginLeft: '20px' }}>
                            <strong>{r.author.name}</strong>: {r.text}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
