import React, { useState } from 'react';
import { authFetch } from '../../api';

export default function Search({ onClose }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ users: [], posts: [], communities: [] });

    const handleSearch = async () => {
        if (!query.trim()) return;
        try {
            const data = await authFetch(`/search?q=${encodeURIComponent(query)}`);
            setResults(data);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000 }}>
            <div style={{ background: 'white', margin: '10% auto', width: '80%', maxWidth: '600px', padding: '20px', borderRadius: '8px' }}>
                <input
                    type="text"
                    placeholder="Search users, posts, communities..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSearch()}
                    style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                />
                <button onClick={handleSearch}>Search</button>
                <button onClick={onClose} style={{ marginLeft: '10px' }}>Close</button>
                <div>
                    <h4>Users</h4>
                    {results.users.map(u => <div key={u._id}>{u.name}</div>)}
                    <h4>Posts</h4>
                    {results.posts.map(p => <div key={p._id}>{p.text}</div>)}
                    <h4>Communities</h4>
                    {results.communities.map(c => <div key={c._id}>{c.name}</div>)}
                </div>
            </div>
        </div>
    );
}
