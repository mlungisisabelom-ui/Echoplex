import React, { useState, useEffect } from 'react';
import { authFetch } from '../../api';
import styled from 'styled-components';

const SettingsContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Section = styled.div`
  background: ${props => props.theme.cardBackground};
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const SectionTitle = styled.h3`
  margin-bottom: 15px;
  color: ${props => props.theme.textColor};
`;

const SettingGroup = styled.div`
  margin-bottom: 15px;
`;

const SettingLabel = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: ${props => props.theme.textColor};
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 24px;
    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
  }
  input:checked + span {
    background-color: #2196F3;
  }
  input:checked + span:before {
    transform: translateX(26px);
  }
`;

const SaveButton = styled.button`
  background: #1877f2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
  &:hover {
    background: #166fe5;
  }
`;

export default function Settings() {
    const [settings, setSettings] = useState({
        notifications: {
            likes: true,
            comments: true,
            friendRequests: true,
            messages: true
        },
        privacy: {
            profileVisible: true,
            postsVisible: true,
            friendsVisible: true
        },
        account: {
            twoFactor: false,
            emailNotifications: true
        }
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    async function fetchSettings() {
        try {
            const data = await authFetch('/settings');
            setSettings(data);
        } catch (e) {
            console.error(e);
        }
    }

    async function saveSettings() {
        try {
            await authFetch('/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings })
            });
            alert('Settings saved successfully!');
        } catch (e) {
            console.error(e);
            alert('Failed to save settings');
        }
    }

    const updateSetting = (category, key, value) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value
            }
        }));
    };

    return (
        <SettingsContainer>
            <h2>Settings</h2>

            <Section>
                <SectionTitle>Notifications</SectionTitle>
                <SettingGroup>
                    <SettingLabel>Likes on my posts</SettingLabel>
                    <ToggleSwitch>
                        <input
                            type="checkbox"
                            checked={settings.notifications.likes}
                            onChange={(e) => updateSetting('notifications', 'likes', e.target.checked)}
                        />
                        <span></span>
                    </ToggleSwitch>
                </SettingGroup>
                <SettingGroup>
                    <SettingLabel>Comments on my posts</SettingLabel>
                    <ToggleSwitch>
                        <input
                            type="checkbox"
                            checked={settings.notifications.comments}
                            onChange={(e) => updateSetting('notifications', 'comments', e.target.checked)}
                        />
                        <span></span>
                    </ToggleSwitch>
                </SettingGroup>
                <SettingGroup>
                    <SettingLabel>Friend requests</SettingLabel>
                    <ToggleSwitch>
                        <input
                            type="checkbox"
                            checked={settings.notifications.friendRequests}
                            onChange={(e) => updateSetting('notifications', 'friendRequests', e.target.checked)}
                        />
                        <span></span>
                    </ToggleSwitch>
                </SettingGroup>
                <SettingGroup>
                    <SettingLabel>Messages</SettingLabel>
                    <ToggleSwitch>
                        <input
                            type="checkbox"
                            checked={settings.notifications.messages}
                            onChange={(e) => updateSetting('notifications', 'messages', e.target.checked)}
                        />
                        <span></span>
                    </ToggleSwitch>
                </SettingGroup>
            </Section>

            <Section>
                <SectionTitle>Privacy</SectionTitle>
                <SettingGroup>
                    <SettingLabel>Profile visible to everyone</SettingLabel>
                    <ToggleSwitch>
                        <input
                            type="checkbox"
                            checked={settings.privacy.profileVisible}
                            onChange={(e) => updateSetting('privacy', 'profileVisible', e.target.checked)}
                        />
                        <span></span>
                    </ToggleSwitch>
                </SettingGroup>
                <SettingGroup>
                    <SettingLabel>Posts visible to everyone</SettingLabel>
                    <ToggleSwitch>
                        <input
                            type="checkbox"
                            checked={settings.privacy.postsVisible}
                            onChange={(e) => updateSetting('privacy', 'postsVisible', e.target.checked)}
                        />
                        <span></span>
                    </ToggleSwitch>
                </SettingGroup>
                <SettingGroup>
                    <SettingLabel>Friends list visible to everyone</SettingLabel>
                    <ToggleSwitch>
                        <input
                            type="checkbox"
                            checked={settings.privacy.friendsVisible}
                            onChange={(e) => updateSetting('privacy', 'friendsVisible', e.target.checked)}
                        />
                        <span></span>
                    </ToggleSwitch>
                </SettingGroup>
            </Section>

            <Section>
                <SectionTitle>Account</SectionTitle>
                <SettingGroup>
                    <SettingLabel>Two-factor authentication</SettingLabel>
                    <ToggleSwitch>
                        <input
                            type="checkbox"
                            checked={settings.account.twoFactor}
                            onChange={(e) => updateSetting('account', 'twoFactor', e.target.checked)}
                        />
                        <span></span>
                    </ToggleSwitch>
                </SettingGroup>
                <SettingGroup>
                    <SettingLabel>Email notifications</SettingLabel>
                    <ToggleSwitch>
                        <input
                            type="checkbox"
                            checked={settings.account.emailNotifications}
                            onChange={(e) => updateSetting('account', 'emailNotifications', e.target.checked)}
                        />
                        <span></span>
                    </ToggleSwitch>
                </SettingGroup>
            </Section>

            <SaveButton onClick={saveSettings}>Save Settings</SaveButton>
        </SettingsContainer>
    );
}
