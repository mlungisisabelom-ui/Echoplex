import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { authFetch } from '../api';

const NotificationsContainer = styled.div`
  position: absolute;
  top: 60px;
  right: 10px;
  width: 300px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
`;

const NotificationItem = styled.div`
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  background: ${props => props.read ? '#f9f9f9' : '#e3f2fd'};
  &:hover {
    background: #f0f0f0;
  }
`;

const NotificationMessage = styled.p`
  margin: 0;
  font-size: 14px;
`;

const NotificationTime = styled.span`
  font-size: 12px;
  color: #666;
`;

export default function Notifications({ isOpen, onClose }) {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    async function fetchNotifications() {
        try {
            const data = await authFetch('/notifications');
            setNotifications(data);
        } catch (e) {
            console.error(e);
        }
    }

    async function markAsRead(id) {
        try {
            await authFetch(`/notifications/${id}/read`, { method: 'POST' });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (e) {
            console.error(e);
        }
    }

    if (!isOpen) return null;

    return (
        <NotificationsContainer>
            {notifications.length === 0 ? (
                <NotificationItem>No notifications</NotificationItem>
            ) : (
                notifications.map(n => (
                    <NotificationItem key={n._id} read={n.read} onClick={() => markAsRead(n._id)}>
                        <NotificationMessage>{n.message}</NotificationMessage>
                        <NotificationTime>{new Date(n.createdAt).toLocaleString()}</NotificationTime>
                    </NotificationItem>
                ))
            )}
        </NotificationsContainer>
    );
}