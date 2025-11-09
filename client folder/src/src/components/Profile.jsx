import React, { useEffect, useState } from 'react';
import { authFetch } from '../api';
import styled from 'styled-components';

export default function Profile({ userId }) {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [bio, setBio] = useState('');
    const [privacy, setPrivacy] = useState('public');

    useEffect(() => {
        fetchProfile();
    }, [userId]);

    async function fetchProfile() {
        try {
            const data = await authFetch(`/users/${userId}`);
            setProfile(data);
            setBio(data.user.bio || '');
            setPrivacy(data.user.privacy || 'public');
        } catch (e) {
            console.error(e);
        }
    }

    async function updateProfile() {
        try {
            await authFetch('/users/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bio, privacy })
            });
            setIsEditing(false);
            fetchProfile();
        } catch (e) {
            console.error(e);
        }
    }

    if (!profile) return <div>Loading...</div>;

    const { user, posts } = profile;
    const isOwnProfile = userId === localStorage.getItem('user')?.id;

    return (
        <ProfileContainer>
            <ProfileHeader>
                <Avatar src={user.avatar || '/default-avatar.png'} alt={user.name} />
                <ProfileInfo>
                    <h2>{user.name}</h2>
                    <p>{user.bio || 'No bio yet'}</p>
                    <p>Friends: {user.friends?.length || 0}</p>
                    {isOwnProfile && (
                        <button onClick={() => setIsEditing(!isEditing)}>
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>
                    )}
                </ProfileInfo>
            </ProfileHeader>

            {isEditing && (
                <EditForm>
                    <textarea
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        placeholder="Write your bio..."
                    />
                    <select value={privacy} onChange={e => setPrivacy(e.target.value)}>
                        <option value="public">Public</option>
                        <option value="friends">Friends Only</option>
                    </select>
                    <button onClick={updateProfile}>Save</button>
                </EditForm>
            )}

            <PostsSection>
                <h3>Posts</h3>
                {posts.map(p => (
                    <Post key={p._id}>
                        <p>{p.text}</p>
                        {p.images && p.images.map((img, idx) => (
                            <img key={idx} src={img} alt="Post" style={{ maxWidth: '100%' }} />
                        ))}
                    </Post>
                ))}
            </PostsSection>
        </ProfileContainer>
    );
}

const ProfileContainer = styled.div`
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const Avatar = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-right: 20px;
`;

const ProfileInfo = styled.div`
  h2 { margin: 0; }
  p { margin: 5px 0; }
`;

const EditForm = styled.div`
  margin-bottom: 20px;
  textarea { width: 100%; min-height: 80px; }
  select { margin-top: 10px; }
`;

const PostsSection = styled.div`
  h3 { margin-bottom: 10px; }
`;

const Post = styled.div`
  border: 1px solid #ddd;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 8px;
`;
