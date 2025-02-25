'use client';
import { useTranslation } from 'react-i18next';
import { Divider, ScrollView, useAuthenticator } from "@aws-amplify/ui-react";
import { AddCircleOutlineTwoTone, CommentOutlined, Delete, LockOutlined } from "@mui/icons-material";
import { Alert, Badge, Box, Button, FormControl, IconButton, Modal, TextField } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { events, EventsChannel } from 'aws-amplify/data';
import { useRouter } from "next/navigation";
import * as React from 'react';
import { useEffect, useState } from "react";
import { Subscription } from 'rxjs';
import { Message, subscribeToChannel } from "../components/EventsHelper";
import TopBar from "../components/TopBar";
import './styles.css';


const drawerWidth = 240;

const formatDateString = function (dateString: string) {
    if (!dateString) {
        return '';
    }

    const date = new Date(dateString);
    return `${date.getHours()}:${date.getMinutes()}`;
}

enum ManagementEventChannelAction {
    CREATE = "CREATE",
    DELETE = "DELETE",
}

type ManagementEvent = {
    channel: string,
    action: ManagementEventChannelAction
}


export default function Channels() {

    const { t } = useTranslation();

    const router = useRouter();

    const {
        authStatus,
        user,
    } = useAuthenticator(context => [
        context.authStatus,
        context.user
    ]);

    useEffect(() => {
        if (authStatus != 'authenticated') {
            router.push('/')
            return;
        } else {
            console.log('Component mounted');


            if (!user || !user.username) {
                return;
            }

            const defaultChannels = ['/default', '/admins'];
            defaultChannels.push(`/users/${user.username}`);

            connectToMessagingChannel('/default');
            connectToMessagingChannel('/admins');
            connectToMessagingChannel(`/users/${user.username}`);

            setChannels(defaultChannels)
            
            subscribeToChannel('/management', (data: any) => {
                const event: ManagementEvent = data.event;
                console.log(event);

                if (event.action === ManagementEventChannelAction.CREATE) {
                    setChannels(prevChannels => [...prevChannels, event.channel]);
                    connectToMessagingChannel(event.channel);
                } else if (event.action == ManagementEventChannelAction.DELETE) {
                    // remove connection from the channel
                    subscriptions[event.channel].subscription.unsubscribe();
                    subscriptions[event.channel].channel.close();
                    delete subscriptions[event.channel];

                    // delete the channel
                    setChannels(prevChannels => prevChannels.filter(channel => channel !== event.channel));
                }
            });

            return () => {
                console.log('Component unmounted, cleaning the subscriptions');
                // Clean up subscriptions or connections here if necessary

                const defaultChannelSubscriptions = subscriptions['/default'];
                if (defaultChannelSubscriptions) {
                    defaultChannelSubscriptions.subscription.unsubscribe();
                    defaultChannelSubscriptions.channel.close();
                    delete subscriptions['/default'];
                }

                const adminsChannelSubscriptions = subscriptions['/admins'];
                if (adminsChannelSubscriptions) {
                    adminsChannelSubscriptions.subscription.unsubscribe();
                    adminsChannelSubscriptions.channel.close();
                    delete subscriptions['/admins'];
                }

                const managementChannelSubscriptions = subscriptions['/management']
                if (managementChannelSubscriptions) {
                    managementChannelSubscriptions.subscription.unsubscribe();
                    managementChannelSubscriptions.channel.close();
                    delete subscriptions['/management'];
                }

                const userChannelSubscriptions = subscriptions[`/users/${user.username}`]
                if (userChannelSubscriptions) {
                    userChannelSubscriptions.subscription.unsubscribe();
                    userChannelSubscriptions.channel.close();
                    delete subscriptions[`/users/${user.username}`];
                }
            };
        }
    }, [authStatus, user])

    const loginId = user?.signInDetails?.loginId || null;

    const [messages, setMessages] = useState<Record<string, Message[]>>({ '/default': [], '/admins': [] });
    const [newMessage, setNewMessage] = useState<string>('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [channels, setChannels] = useState<string[]>([]);
    const [selectedChannel, setSelectedChannel] = useState<string>('/default');

    const subscriptions: Record<string, { channel: EventsChannel, subscription: Subscription }> = {};
    const [unreadMessages, setUnreadMessages] = useState<Record<string, number>>({});


    const selectedChannelRef = React.useRef(selectedChannel); // Create a ref for selectedChannel

    // Update ref whenever selectedChannel changes
    useEffect(() => {
        selectedChannelRef.current = selectedChannel;
    }, [selectedChannel]);

    const incrementUnreadCount = (channelName: string) => {
        if (channelName !== selectedChannelRef.current) {
            setUnreadMessages(prevState => ({
                ...prevState,
                [channelName]: (prevState[channelName] || 0) + 1
            }));
        }
    };

    const resetUnreadCount = (channel: string) => {
        setUnreadMessages(prevState => ({
            ...prevState,
            [channel]: 0
        }));

        console.log(unreadMessages);
    };


    const connectToMessagingChannel = (channel: string) => {
        if (!subscriptions[channel]) {
            subscribeToChannel(channel, (data: any) => {
                const newMessage: Message = data.event;
                console.log(data);

                setMessages(prevMessages => ({
                    ...prevMessages,
                    [channel]: [...(prevMessages[channel] || []), newMessage]
                }));

                incrementUnreadCount(channel)

            }).then(data => {
                subscriptions[channel] = data;
            })
        }
    }



    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            // Clear the textarea
            setNewMessage('');

            // Publish the message through the events channel
            await events.post(selectedChannel, {
                message: newMessage,
                loginId: loginId
            })


        } catch (error: any) {
            console.error('Error sending message', error);
            if (error.name === 'UnauthorizedException') {
                setErrors(prevErrors => ({
                    ...prevErrors,
                    [selectedChannel]: 'Error: only authorized users can publish to this channel!'
                }));
            }
        }
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevents adding a new line
            handleSendMessage(); // Calls send message function
        }
    }

    const handleClickChannel = (channelName: string) => {
        setSelectedChannel(channelName);
        resetUnreadCount(channelName);
    }

    const [open, setOpen] = useState(false);
    const [newChannelName, setNewChannelName] = useState('');
    const modalHandleOpen = () => setOpen(true);
    const modalHandleClose = () => setOpen(false);

    const handleDelete = async (channel: string) => {
        const event: ManagementEvent = {
            channel: channel,
            action: ManagementEventChannelAction.DELETE
        }

        await events.post('/management', event)
    }

    const handleAddChannel = () => {
        if (newChannelName.trim()) {
            // Convert to lowercase and ensure it starts with a '/'
            let formattedChannelName = newChannelName.toLowerCase().trim();
            formattedChannelName = formattedChannelName.startsWith('/default/')
                ? formattedChannelName
                : '/default/' + formattedChannelName;


            setNewChannelName('');
            modalHandleClose();

            // select the channel after adding it
            setSelectedChannel(formattedChannelName);

            // broadcast that channel was added everywhere
            const event: ManagementEvent = {
                channel: formattedChannelName,
                action: ManagementEventChannelAction.CREATE
            }

            events.post('/management', event)
        }
    };

    const handleAddChannelKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            handleAddChannel();
        }
    };


    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <TopBar />
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        {channels.map((channelName, index) => (
                            <ListItem className="hover-item"
                                key={channelName}
                                disablePadding
                                onClick={() => handleClickChannel(channelName)}
                                secondaryAction={
                                    index > 2 && (
                                        <IconButton aria-label="comment" className="hover-button" onClick={() => handleDelete(channelName)}>
                                            <Delete />
                                        </IconButton>
                                    )
                                }
                            >
                                <ListItemButton selected={channelName === selectedChannel}>
                                    <ListItemIcon>
                                        {channelName === '/admins' || channelName.startsWith('/users/') ? (<LockOutlined />) : (<CommentOutlined />)}

                                    </ListItemIcon>
                                    <ListItemText primary={channelName} />
                                    {unreadMessages[channelName] > 0 && (
                                        <Badge badgeContent={unreadMessages[channelName]} color="secondary" />
                                    )}
                                </ListItemButton>
                            </ListItem>
                        ))}
                        <Divider />

                        <ListItem>
                            <ListItemButton onClick={modalHandleOpen}>
                                <ListItemIcon>
                                    <AddCircleOutlineTwoTone />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Add New"
                                    sx={{ fontSize: '0.875rem' }} // Adjust font size here
                                    primaryTypographyProps={{ fontSize: '0.875rem' }} // Ensure typography respects font size
                                />
                            </ListItemButton>
                        </ListItem>

                    </List>
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                <ScrollView style={{ height: '400px', overflowY: 'scroll' }}>
                    {messages[selectedChannel] && messages[selectedChannel].map((msg, key) => (
                        <Alert
                            style={{ margin: '10px' }}
                            severity="success"
                            action={
                                <>
                                    <span>
                                        {msg.loginId}
                                    </span>
                                    <span style={{ marginLeft: '10px', color: 'black', fontWeight: 'bold' }}>
                                        / {formatDateString(msg.timestamp)}
                                    </span>

                                </>
                            }
                            key={key}
                        >
                            {msg.message}
                        </Alert>
                    ))}

                    {errors[selectedChannel] && (
                        <Alert
                            style={{ margin: '10px' }}
                            severity="error"
                        >
                            {errors[selectedChannel]}
                        </Alert>
                    )}
                </ScrollView>
                <Divider />
                <FormControl fullWidth sx={{ m: 1 }} variant="standard">
                    <TextField
                        id="standard-multiline-static"
                        multiline
                        rows={4}
                        variant="standard"
                        label={t('channels.message.newMessage')}
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => { handleKeyDown(e) }}
                    />
                    <Button onClick={handleSendMessage}>{t('channels.message.send')}</Button>
                </FormControl>
            </Box>
            <Modal
                open={open}
                onClose={modalHandleClose}
                aria-labelledby="modal-title"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 300,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                }}>
                    <Typography id="modal-title" variant="h6" component="h2" gutterBottom color="primary">
                        {t('channels.manage.addNewChannel')}
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="channel-name"
                        label={t('channels.manage.channelName')}
                        type="text"
                        fullWidth
                        value={newChannelName}
                        onChange={(e) => setNewChannelName(e.target.value)}
                        onKeyDown={handleAddChannelKeyDown}
                        autoComplete="off"
                    />
                    <Button onClick={handleAddChannel} sx={{ mt: 2 }}>
                        {t('channels.manage.addChannel')}
                    </Button>
                </Box>
            </Modal>

        </Box>
    );
}
