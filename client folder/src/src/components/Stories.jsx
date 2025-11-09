import React, { useEffect, useState } from 'react';
import { authFetch } from '../../api';

export default function Stories() {
    const [stories, setStories] = useState([]);

    useEffect(() => {
        fetchStories();
    }, []);

    async function fetchStories() {
        try {
            const data = await authFetch('/stories');
            setStories(data);
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div style={{ display: 'flex', gap: '10px', padding: '10px', borderBottom: '1px solid #ddd' }}>
            {stories.map(s => (
                <div key={s._id} style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid #007bff', overflow: 'hidden' }}>
                    <img src={s.media} alt="Story" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
            ))}
        </div>
    );
}
