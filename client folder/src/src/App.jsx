import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { API_BASE, authFetch, sharePost } from '../api';
import PlexaPanel from './components/PlexaPanel';
import Profile from './components/Profile';
import Notifications from './components/Notifications';
import Settings from './components/Settings';
import Marketplace from './components/Marketplace';
import Search from './components/Search';
import Stories from './components/Stories';
import CommentSection from './components/CommentSection';
import styled, { ThemeProvider } from 'styled-components';
import { useDropzone } from 'react-dropzone';

const socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:4000');

const lightTheme = {
    background: '#f6f7fb',
    cardBackground: '#fff',
    textColor: '#222',
    borderColor: '#eef2ff'
};

const darkTheme = {
    background: '#222',
    cardBackground: '#333',
    textColor: '#f6f7fb',
    borderColor: '#444'
};

function FriendRequests({ onAccept, onDecline }) {
    const [requests, setRequests] = useState([]);
    useEffect(() => {
        fetchRequests();
    }, []);
    async function fetchRequests() {
        try {
            const data = await authFetch('/friends/requests');
            setRequests(data);
        } catch (e) {
            console.error(e);
        }
    }
    return (
        <Card>
            <h4>Friend Requests</h4>
            {requests.length === 0 ? (
                <p>No requests</p>
            ) : (
                requests.map(r => (
                    <div key={r._id} style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                        <img src={r.from.avatar || '/default-avatar.png'} alt={r.from.name} style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 10 }} />
                        <span>{r.from.name}</span>
                        <button onClick={() => onAccept(r._id)} style={{ marginLeft: 'auto', marginRight: 5 }}>Accept</button>
                        <button onClick={() => onDecline(r._id)}>Decline</button>
                    </div>
                ))
            )}
        </Card>
    );
}

export default function App() {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
    const [feed, setFeed] = useState([]);
    const [friends, setFriends] = useState([]);
    const [messages, setMessages] = useState({});
    const [theme, setTheme] = useState('light');
    const [communities, setCommunities] = useState([]);
    const [currentView, setCurrentView] = useState('feed'); // 'feed', 'profile', 'settings', 'marketplace'
    const [profileUserId, setProfileUserId] = useState(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    useEffect(() => {
        if (user) socket.emit('presence:online', user.id);
        socket.on('private:message', (m) => {
            setMessages(prev => ({ ...prev, [m.from]: [...(prev[m.from] || []), m] }));
        });
        return () => socket.off('private:message');
    }, [user]);

    useEffect(() => {
        fetchFeed();
        fetchCommunities();
        fetchFriends();
    }, []);

    async function fetchFeed() {
        try {
            const r = await fetch(`${API_BASE}/posts`);
            const data = await r.json();
            setFeed(data);
        } catch (e) {
            console.error(e);
        }
    }

    async function fetchCommunities() {
        try {
            const r = await fetch(`${API_BASE}/communities`);
            const data = await r.json();
            setCommunities(data);
        } catch (e) {
            console.error(e);
        }
    }

    async function fetchFriends() {
        try {
            const data = await authFetch('/friends');
            setFriends(data);
        } catch (e) {
            console.error(e);
        }
    }

    async function createPost(postData) {
        try {
            const formData = new FormData();
            formData.append('text', postData.text);
            if (postData.images) postData.images.forEach(file => formData.append('images', file));
            if (postData.audio) formData.append('audio', postData.audio);
            if (postData.location) formData.append('location', postData.location);
            if (postData.poll) {
                formData.append('pollQuestion', postData.poll.question);
                formData.append('pollOptions', JSON.stringify(postData.poll.options));
            }
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/posts`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                body: formData
            });
            const p = await res.json();
            setFeed(prev => [p, ...prev]);
        } catch (e) {
            alert('Login required to post or an error occurred.');
            console.error(e);
        }
    }

    async function voteOnPoll(postId, optionIndex) {
        try {
            const res = await authFetch(`/posts/${postId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ optionIndex })
            });
            setFeed(prev => prev.map(p => p._id === postId ? { ...p, poll: res.poll } : p));
        } catch (e) {
            console.error(e);
        }
    }

    async function handleShare(postId, shareText = '') {
        try {
            const sharedPost = await sharePost(postId, shareText);
            setFeed(prev => [sharedPost, ...prev]);
        } catch (e) {
            console.error(e);
        }
    }

    async function handleAcceptRequest(requestId) {
        try {
            await authFetch(`/friends/accept/${requestId}`, { method: 'POST' });
            // Refresh friends and requests
            fetchFriends();
        } catch (e) {
            console.error(e);
        }
    }

    async function handleDeclineRequest(requestId) {
        try {
            await authFetch(`/friends/decline/${requestId}`, { method: 'POST' });
            // Refresh requests
        } catch (e) {
            console.error(e);
        }
    }

    function viewProfile(userId) {
        setProfileUserId(userId);
        setCurrentView('profile');
    }

    function goToFeed() {
        setCurrentView('feed');
        setProfileUserId(null);
    }

    return (
        <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
            <Container>
                <Header>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <Logo onClick={goToFeed}>Echoplex4</Logo>
                        <button onClick={() => setCurrentView('feed')}>Home</button>
                        <button onClick={() => setCurrentView('marketplace')}>Marketplace</button>
                        <SearchButton onClick={() => setShowSearch(true)}>🔍 Search</SearchButton>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <NotificationButton onClick={() => setShowNotifications(!showNotifications)}>
                            Notifications
                        </NotificationButton>
                        <button onClick={() => setCurrentView('settings')}>Settings</button>
                        <ThemeToggleButton onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                            Toggle Theme
                        </ThemeToggleButton>
                    </div>
                    <Notifications isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
                    {showSearch && <Search onClose={() => setShowSearch(false)} />}
                </Header>
                <AppGrid>
                    <Sidebar>
                        <FriendRequests onAccept={handleAcceptRequest} onDecline={handleDeclineRequest} />
                        <Card style={{ marginTop: 18 }}>
                            <h4>Friends</h4>
                            {friends.length === 0 ? (
                                <p>No friends yet</p>
                            ) : (
                                friends.map(f => <Friend key={f._id}>{f.name}</Friend>)
                            )}
                        </Card>
                        <Card style={{ marginTop: 18 }}>
                            <h4>Trending Circles</h4>
                            {communities.length === 0 ? (
                                <p>No communities found</p>
                            ) : (
                                communities.map(c => <Community key={c._id}>{c.name}</Community>)
                            )}
                        </Card>
                    </Sidebar>
                    <MainContent>
                        {currentView === 'feed' ? (
                            <Card>
                                <Stories />
                                <Composer onPost={createPost} />
                            <Feed feed={feed} onVote={voteOnPoll} onViewProfile={viewProfile} onCommentAdded={fetchFeed} onShare={handleShare} />
                            </Card>
                        ) : currentView === 'profile' ? (
                            <Profile userId={profileUserId} />
                        ) : currentView === 'settings' ? (
                            <Settings />
                        ) : currentView === 'marketplace' ? (
                            <Marketplace />
                        ) : null}
                    </MainContent>
                    <Aside>
                        <Card>
                            <PlexaPanel />
                        </Card>
                    </Aside>
                </AppGrid>
            </Container>
        </ThemeProvider>
    );
}

function Composer({ onPost }) {
    const [text, setText] = useState('');
    const [images, setImages] = useState([]);
    const [audio, setAudio] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [poll, setPoll] = useState({ question: '', options: ['', ''] });
    const [showPoll, setShowPoll] = useState(false);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: acceptedFiles => setImages(acceptedFiles),
        accept: { 'image/*': [] }
    });

    const handleAudioRecord = () => {
        setIsRecording(!isRecording);
    };

    const handlePollChange = (index, value) => {
        const newOptions = [...poll.options];
        newOptions[index] = value;
        setPoll({ ...poll, options: newOptions });
    };

    const addPollOption = () => setPoll({ ...poll, options: [...poll.options, ''] });

    const handlePost = () => {
        const postData = { text, images, audio };
        if (showPoll && poll.question) {
            postData.poll = { question: poll.question, options: poll.options.filter(o => o.trim() !== '') };
        }
        onPost(postData);
        setText('');
        setImages([]);
        setAudio(null);
        setShowPoll(false);
        setPoll({ question: '', options: ['', ''] });
    };

    return (
        <ComposerContainer>
            <ComposerTextarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="What's on your mind?"
            />
            <VoiceControls>
                <button>🎙️ Voice Post (Conceptual)</button>
                <button>🔊 Read Post (Conceptual)</button>
            </VoiceControls>
            <DropzoneArea {...getRootProps()} isActive={isDragActive}>
                <input {...getInputProps()} />
                {isDragActive ? <p>Drop images here</p> : <p>Drag 'n' drop images or click to select</p>}
            </DropzoneArea>
            {images.length > 0 && (
                <FilePreview>
                    {images.map(file => <span key={file.name}>{file.name}</span>)}
                </FilePreview>
            )}
            <button onClick={() => setShowPoll(!showPoll)}>
                {showPoll ? 'Hide Poll' : 'Add a Poll'}
            </button>
            {showPoll && (
                <PollContainer>
                    <input
                        type="text"
                        placeholder="Poll question"
                        value={poll.question}
                        onChange={e => setPoll({ ...poll, question: e.target.value })}
                    />
                    {poll.options.map((option, index) => (
                        <input
                            key={index}
                            type="text"
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={e => handlePollChange(index, e.target.value)}
                        />
                    ))}
                    <button onClick={addPollOption}>Add Option</button>
                </PollContainer>
            )}
            <ComposerButton onClick={handlePost}>Post</ComposerButton>
        </ComposerContainer>
    );
}

function Feed({ feed, onVote, onViewProfile, onCommentAdded, onShare }) {
    return (
        <FeedContainer>
            <AdBanner>
                <p>Your Ad Here</p>
            </AdBanner>
            {feed.map(p => (
                <Post key={p._id}>
                    <PostHeader>
                        <PostAuthor onClick={() => onViewProfile(p.author._id)} style={{ cursor: 'pointer' }}>
                            {p.author?.name || 'Unknown'}
                        </PostAuthor>
                        <BadgesContainer>
                            {p.author?.badges?.map(badge => <span key={badge}>{badge}</span>)}
                        </BadgesContainer>
                        <PostDate>{new Date(p.createdAt).toLocaleString()}</PostDate>
                        <ShareButton onClick={() => onShare(p._id)}>Share ({p.shares ? p.shares.length : 0})</ShareButton>
                    </PostHeader>
                    {p.sharedPost ? (
                        <SharedPostContainer>
                            <SharedText>{p.shareText}</SharedText>
                            <OriginalPost>
                                <PostHeader>
                                    <PostAuthor onClick={() => onViewProfile(p.sharedPost.author._id)} style={{ cursor: 'pointer' }}>
                                        {p.sharedPost.author?.name || 'Unknown'}
                                    </PostAuthor>
                                    <BadgesContainer>
                                        {p.sharedPost.author?.badges?.map(badge => <span key={badge}>{badge}</span>)}
                                    </BadgesContainer>
                                    <PostDate>{new Date(p.sharedPost.createdAt).toLocaleString()}</PostDate>
                                </PostHeader>
                                <PostText>{p.sharedPost.text}</PostText>
                                {p.sharedPost.images && p.sharedPost.images.map((imgUrl, index) => (
                                    <PostImage key={index} src={imgUrl} alt="Post image" />
                                ))}
                                {p.sharedPost.poll && (
                                    <PollDisplay>
                                        <p>{p.sharedPost.poll.question}</p>
                                        {p.sharedPost.poll.options.map((opt, idx) => (
                                            <PollOption key={idx}>
                                                <span>{opt.text}</span>
                                                <PollVotes>({opt.votes} votes)</PollVotes>
                                                <button onClick={() => onVote(p.sharedPost._id, idx)}>Vote</button>
                                            </PollOption>
                                        ))}
                                    </PollDisplay>
                                )}
                            </OriginalPost>
                        </SharedPostContainer>
                    ) : (
                        <>
                            <PostText>{p.text}</PostText>
                            {p.images && p.images.map((imgUrl, index) => (
                                <PostImage key={index} src={imgUrl} alt="Post image" />
                            ))}
                            {p.poll && (
                                <PollDisplay>
                                    <p>{p.poll.question}</p>
                                    {p.poll.options.map((opt, idx) => (
                                        <PollOption key={idx}>
                                            <span>{opt.text}</span>
                                            <PollVotes>({opt.votes} votes)</PollVotes>
                                            <button onClick={() => onVote(p._id, idx)}>Vote</button>
                                        </PollOption>
                                    ))}
                                </PollDisplay>
                            )}
                        </>
                    )}
                    <CommentSection postId={p._id} comments={p.comments || []} onCommentAdded={onCommentAdded} />
                </Post>
            ))}
        </FeedContainer>
    );
}

const Container = styled.div`
  background: ${props => props.theme.background};
  min-height: 100vh;
  font-family: Arial, sans-serif;
  color: ${props => props.theme.textColor};
`;

const Header = styled.header`
  background: linear-gradient(90deg, #3b5998, #007bff);
  color: #fff;
  padding: 12px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  cursor: pointer;
  font-size: 1.5rem;
  font-weight: bold;
`;

const ThemeToggleButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  padding: 6px 10px;
  font-size: 0.8rem;
`;

const SearchButton = styled.button`
  position: absolute;
  left: 150px;
  top: 50%;
  transform: translateY(-50%);
  padding: 6px 10px;
  font-size: 0.8rem;
  background: #f0f2f5;
  color: #333;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const NotificationButton = styled.button`
  position: absolute;
  right: 80px;
  top: 50%;
  transform: translateY(-50%);
  padding: 6px 10px;
  font-size: 0.8rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const AppGrid = styled.div`
  display: grid;
  grid-template-columns: 260px 1fr 320px;
  gap: 18px;
  padding: 18px;
  max-width: 1200px;
  margin: 12px auto;
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.aside`
  background: ${props => props.theme.cardBackground};
  padding: 12px;
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(20, 20, 30, 0.06);
  @media (max-width: 1200px) {
    display: none;
  }
`;

const MainContent = styled.main`
  min-height: 400px;
`;

const Aside = styled.aside`
  @media (max-width: 1200px) {
    display: none;
  }
`;

const Card = styled.div`
  background: ${props => props.theme.cardBackground};
  padding: 12px;
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(20, 20, 30, 0.06);
`;

const ComposerContainer = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.borderColor};
`;

const ComposerTextarea = styled.textarea`
  width: 100%;
  min-height: 70px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e6e6ea;
  background: #fff;
  color: #222;
`;

const VoiceControls = styled.div`
  border: 2px dashed ${props => props.isActive ? '#007bff' : '#ddd'};
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  margin-top: 10px;
  color: #888;
`;

const DropzoneArea = styled.div`
  border: 2px dashed ${props => props.isActive ? '#007bff' : '#ddd'};
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  margin-top: 10px;
  color: #888;
`;

const FilePreview = styled.div`
  margin-top: 10px;
  font-size: 12px;
  color: #555;
`;

const ComposerButton = styled.button`
  background: #007bff;
  color: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  margin-top: 10px;
  width: 100%;
`;

const FeedContainer = styled.div`
  padding: 12px;
`;

const Post = styled.div`
  padding: 15px;
  border-radius: 10px;
  border: 1px solid ${props => props.theme.borderColor};
  margin-bottom: 15px;
  background: ${props => props.theme.cardBackground};
`;

const PostHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const PostAuthor = styled.div`
  font-weight: bold;
  color: #3b5998;
`;

const PostDate = styled.div`
  font-size: 0.8em;
  color: #999;
`;

const BadgesContainer = styled.div`
  span {
    background: #eef2ff;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.7em;
    color: #3b5998;
    margin-left: 5px;
  }
`;

const PostText = styled.p`
  margin: 0 0 10px;
  white-space: pre-wrap;
`;

const PostImage = styled.img`
  max-width: 100%;
  border-radius: 8px;
  margin-top: 10px;
`;

const Friend = styled.div`
  padding: 8px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  &:hover {
    background: #f0f2f5;
  }
`;

const Community = styled.div`
  padding: 8px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  &:hover {
    background: #f0f2f5;
  }
`;

const AdBanner = styled.div`
  text-align: center;
  padding: 20px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 15px;
`;

const PollDisplay = styled.div`
  margin-top: 15px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
`;

const PollOption = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
`;

const PollVotes = styled.span`
  font-size: 0.9em;
  color: #666;
`;

const PollContainer = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ShareButton = styled.button`
  background: #007bff;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.8em;
`;

const SharedPostContainer = styled.div`
  border-left: 4px solid #007bff;
  padding-left: 10px;
  margin: 10px 0;
`;

const SharedText = styled.p`
  font-style: italic;
  color: #666;
  margin-bottom: 10px;
`;

const OriginalPost = styled.div`
  background: ${props => props.theme.cardBackground};
  padding: 10px;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.borderColor};
`;

const PlexaPanelContainer = styled.div`
  padding: 12px;
`;

const MoodSuggestions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  button {
    padding: 6px 10px;
    font-size: 0.8rem;
    border-radius: 20px;
    background: #f0f2f5;
    border: none;
    cursor: pointer;
    color: #007bff;
  }
`;

const PlexaTextarea = styled.textarea`
  width: 100%;
  min-height: 70px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e6e6ea;
  background: #fff;
  color: #222;
`;

const PlexaButton = styled.button`
  background: #007bff;
  color: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  margin-top: 10px;
  width: 100%;
`;

const PlexaReply = styled.pre`
  white-space: pre-wrap;
  margin-top: 12px;
  background: #f0f2f5;
  padding: 10px;
  border-radius: 8px;
`;
