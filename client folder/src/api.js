export const API_BASE = import.meta.env.VITE_API_BASE
    || 'http://localhost:4000/api';
export async function authFetch(path, opts = {}) {
    const token = localStorage.getItem('token');
    opts.headers = opts.headers || {};
    if (token) opts.headers['Authorization'] = 'Bearer ' + token;
    const res = await fetch(`${API_BASE}${path}`, opts);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// Additional API calls
export async function fetchStories() {
    return authFetch('/stories');
}

export async function search(query) {
    return authFetch(`/search?q=${encodeURIComponent(query)}`);
}

export async function addComment(postId, text) {
    return authFetch(`/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    });
}

export async function addReply(postId, commentId, text) {
    return authFetch(`/posts/${postId}/comment/${commentId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    });
}

export async function likeComment(postId, commentId) {
    return authFetch(`/posts/${postId}/comment/${commentId}/like`, { method: 'POST' });
}

export async function fetchSettings() {
    return authFetch('/settings');
}

export async function updateSettings(settings) {
    return authFetch('/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
    });
}

export async function fetchMarketplaceItems(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return authFetch(`/marketplace?${query}`);
}

export async function createMarketplaceItem(itemData, images) {
    const formData = new FormData();
    Object.keys(itemData).forEach(key => {
        formData.append(key, itemData[key]);
    });
    images.forEach((image, index) => {
        formData.append('images', image);
    });
    return authFetch('/marketplace', {
        method: 'POST',
        body: formData
    });
}

export async function updateMarketplaceItemStatus(itemId, status) {
    return authFetch(`/marketplace/${itemId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
}

export async function deleteMarketplaceItem(itemId) {
    return authFetch(`/marketplace/${itemId}`, {
        method: 'DELETE'
    });
}

export async function sharePost(postId, shareText = '') {
    return authFetch(`/posts/${postId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareText })
    });
}

export async function assignBadge(userId, badge) {
    return authFetch(`/users/${userId}/badge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badge })
    });
}

export async function sendMessage(otherId, messageData) {
    return authFetch(`/messages/${otherId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
    });
}

export async function markMessagesRead(otherId) {
    return authFetch(`/messages/${otherId}/read`, {
        method: 'PUT'
    });
}

export async function createStory(storyData, media) {
    const formData = new FormData();
    Object.keys(storyData).forEach(key => {
        formData.append(key, storyData[key]);
    });
    if (media) formData.append('media', media);
    return authFetch('/stories', {
        method: 'POST',
        body: formData
    });
}

export async function getCommunities() {
    return authFetch('/communities');
}

export async function getCommunity(id) {
    return authFetch(`/communities/${id}`);
}

export async function createCommunity(communityData) {
    return authFetch('/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(communityData)
    });
}

export async function joinCommunity(id) {
    return authFetch(`/communities/${id}/join`, {
        method: 'POST'
    });
}

export async function leaveCommunity(id) {
    return authFetch(`/communities/${id}/leave`, {
        method: 'POST'
    });
}
