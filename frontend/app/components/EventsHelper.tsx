import { events } from 'aws-amplify/data';

export type Message = {
    message: string,
    loginId: string,
    timestamp: string,
}

// Define the type for the callback function
type SubscriptionCallback = (data: any) => void;

export async function subscribeToChannel(channelName: string, callback: SubscriptionCallback) {

    console.log(`Subscribing to channel ${channelName}`);

    try {
        const channel = await events.connect(channelName);

        const subscription = channel.subscribe({
            next: (data) => {
                console.log('received', data);
                callback(data);
            },
            error: (err) => console.error('error', err),
        });

        return {
            channel,
            subscription
        }
    } catch (error) {
        console.error('Connection error', error);
        throw error;
    }
}