import { kv } from '@vercel/kv';
import dayjs from 'dayjs';
import { google } from 'googleapis';
import { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import styles from './page.module.css';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

const youtubeClient = google.youtube({
    version: 'v3',
});

const CHANNELS = [
    'UCMGfV7TVTmHhEErVJg1oHBQ',
    'UCWQtYtq9EOB4-I5P-3fh8lA',
    'UCtyWhCj3AqKh2dXctLkDtng',
    'UCdXAk5MpyLD8594lm_OvtGQ',
    'UC1iA6_NT4mtAcIII6ygrvCw',
];

async function fetchChannels() {
    const list = await youtubeClient.channels.list({
        part: ['snippet', 'statistics'],
        id: CHANNELS,
        key: YOUTUBE_API_KEY,
    });

    return CHANNELS.map((channelId) => {
        const channel = list.data.items?.find((item) => item.id === channelId);

        return {
            id: channel?.id || '',
            name: channel?.snippet?.title || '',
            avatar: channel?.snippet?.thumbnails?.high?.url || '',
            url: `https://www.youtube.com/channel/${channelId}`,
            subscribersCount: parseInt(
                channel?.statistics?.subscriberCount || '0',
            ),
        };
    });
}

async function fetchTotalSubscriberCountFromCache() {
    noStore();

    const count = await kv.get<number>('count');
    const expiryString = await kv.get<string>('expiry');

    const expiry = expiryString ? dayjs(expiryString) : undefined;

    if (!expiry || dayjs().isAfter(expiry)) {
        return null;
    }

    return count;
}

async function updateCache(count: number) {
    console.log(`Updating cache value: ${count}`);
    await kv.set('count', count);
    await kv.set('expiry', dayjs().add(1, 'minute').toISOString());
}

async function fetchTotalSubscriberCount() {
    const countFromCache = await fetchTotalSubscriberCountFromCache();

    if (!countFromCache) {
        const channels = await fetchChannels();

        const countFromYouTube = getTotalSubscribersCount(channels);

        await updateCache(countFromYouTube);

        return countFromYouTube;
    }

    return countFromCache;
}

function ProgressBar({ percentage }: { percentage: number }) {
    return (
        <div className={styles['progress-bar-container']}>
            <div
                className={styles['progress-bar-inner']}
                style={{ width: `${percentage}%` }}
            ></div>
            <div className={styles['progress-bar-percentage']}>
                {percentage.toFixed(0)}%
            </div>
        </div>
    );
}

const GOAL_COUNT = 2500000;

export async function generateMetadata(): Promise<Metadata> {
    const totalSubscribersCount = await fetchTotalSubscriberCount();
    const percentage = Math.min(
        Math.floor((totalSubscribersCount / GOAL_COUNT) * 100),
        100,
    );

    const description =
        percentage < 100
            ? `ReGLOSS has reached ${percentage.toFixed(
                  0,
              )}% of their goal. Current subscribers: ${totalSubscribersCount.toLocaleString()}`
            : 'ReGLOSS has reached the goal for their 3D debut. Congratulations!';

    return {
        description,
        openGraph: {
            description,
        },
    };
}

function getTotalSubscribersCount(
    channels: Awaited<ReturnType<typeof fetchChannels>>,
) {
    return channels.reduce(
        (total, channel) => total + channel.subscribersCount,
        0,
    );
}

export default async function Home() {
    const channels = await fetchChannels();

    const totalSubscribersCount = getTotalSubscribersCount(channels);

    const percentage = Math.min(
        Math.floor((totalSubscribersCount / GOAL_COUNT) * 100),
        100,
    );

    const text =
        percentage < 100 ? (
            <>
                ReGLOSS has reached <strong>{percentage.toFixed(0)}%</strong> of
                their goal.
            </>
        ) : (
            'ReGLOSS has reached the goal for their 3D debut. Congratulations!'
        );

    return (
        <>
            <div className={styles['background-container']}>
                <div className={styles['background']}></div>
            </div>
            <main className={styles.main}>
                <div className={styles['text-container']}>{text}</div>
                <ProgressBar percentage={percentage} />
                <div className={styles['details-container']}>
                    <p>
                        Current Subscribers:{' '}
                        {totalSubscribersCount.toLocaleString()}
                    </p>
                    <p>Subscribers Goal: {GOAL_COUNT.toLocaleString()}</p>
                </div>
                <div className={styles['channels-container']}>
                    {channels.map((channel) => (
                        <a key={channel.id} href={channel.url} target="_blank">
                            <div className={styles['channel-container']}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    className={styles['channel-avatar']}
                                    src={channel.avatar}
                                    alt={channel.name}
                                    width={176}
                                    height={176}
                                />
                                <p className={styles['channel-text']}>
                                    {channel.name}
                                </p>
                            </div>
                        </a>
                    ))}
                </div>
            </main>
        </>
    );
}
