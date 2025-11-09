import React, { useEffect, useState } from 'react';
import { getCommunities, createCommunity, joinCommunity, leaveCommunity } from '../../api';

export default function Communities() {
    const [communities, setCommunities] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', rules: [], isPrivate: false });

    useEffect(() => {
        loadCommunities();
    }, []);

    async function loadCommunities() {
        try {
            const data = await getCommunities();
            setCommunities(data);
        } catch (e) {
            console.error(e);
        }
    }

    async function handleCreate(e) {
        e.preventDefault();
        try {
            await createCommunity(formData);
            setFormData({ name: '', description: '', rules: [], isPrivate: false });
            setShowCreateForm(false);
            loadCommunities();
        } catch (e) {
            console.error(e);
        }
    }

    async function handleJoin(id) {
        try {
            await joinCommunity(id);
            loadCommunities();
        } catch (e) {
            console.error(e);
        }
    }

    async function handleLeave(id) {
        try {
            await leaveCommunity(id);
            loadCommunities();
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div style={{ padding: '20px' }}>
            <h2>Communities</h2>
            <button onClick={() => setShowCreateForm(!showCreateForm)} style={{ marginBottom: '20px' }}>
                {showCreateForm ? 'Cancel' : 'Create Community'}
            </button>

            {showCreateForm && (
                <form onSubmit={handleCreate} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <input
                        type="text"
                        placeholder="Community Name"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                        style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
                    />
                    <textarea
                        placeholder="Description"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        style={{ width: '100%', marginBottom: '10px', padding: '8px', minHeight: '60px' }}
                    />
                    <label>
                        <input
                            type="checkbox"
                            checked={formData.isPrivate}
                            onChange={e => setFormData({ ...formData, isPrivate: e.target.checked })}
                        />
                        Private Community
                    </label>
                    <button type="submit" style={{ marginTop: '10px' }}>Create</button>
                </form>
            )}

            <div>
                {communities.map(community => (
                    <div key={community._id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '10px' }}>
                        <h3>{community.name}</h3>
                        <p>{community.description}</p>
                        <p>Members: {community.members?.length || 0}</p>
                        <button onClick={() => handleJoin(community._id)}>Join</button>
                        <button onClick={() => handleLeave(community._id)} style={{ marginLeft: '10px' }}>Leave</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
