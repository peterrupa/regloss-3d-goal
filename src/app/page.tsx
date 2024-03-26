import { google } from 'googleapis';
import Image from 'next/image';
import styles from './page.module.css';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

const youtubeClient = google.youtube({
    version: 'v3',
});

async function fetchTotalSubscriberCount() {
    // @TODO: implement cache
    const list = await youtubeClient.channels.list({
        part: ['statistics'],
        id: CHANNELS.map((channel) => channel.id),
        key: YOUTUBE_API_KEY,
    });

    const total =
        list.data.items?.reduce(
            (total, current) =>
                total + parseInt(current.statistics?.subscriberCount || '0'),
            0
        ) ?? 0;

    return total;
}

const CHANNELS = [
    {
        id: 'UCMGfV7TVTmHhEErVJg1oHBQ',
        url: 'https://www.youtube.com/@HiodoshiAo',
        name: 'Hiodoshi Ao',
        avatar: 'https://yt3.googleusercontent.com/-D2Cf4dIQGO_CcY_1F9i63TcHyY0EuPV1pYskJQmQHIClJGOt34BoI84zlgje_THCw8AprB6=s176-c-k-c0x00ffffff-no-rj',
    },
    {
        id: 'UCWQtYtq9EOB4-I5P-3fh8lA',
        url: 'https://www.youtube.com/@OtonoseKanade',
        name: 'Otonose Kanade',
        avatar: 'https://yt3.googleusercontent.com/o03i3rWw98BSquRZFhyiDQuunr1cr_9xEBVNNx3Cq8vqlJZVKXMgKsVLGW2AlbsFTvphGiHRCg0=s176-c-k-c0x00ffffff-no-rj',
    },
    {
        id: 'UCtyWhCj3AqKh2dXctLkDtng',
        url: 'https://www.youtube.com/@IchijouRirika',
        name: 'Ichijou Ririka',
        avatar: 'https://yt3.googleusercontent.com/TQwdYxMCQYmBQskSxmdAbfAqRR__ROlB-mFGlCFqLF4C-6vHpjYkWj9GbnlKOoOTaOMssRGw=s176-c-k-c0x00ffffff-no-rj',
    },
    {
        id: 'UCdXAk5MpyLD8594lm_OvtGQ',
        url: 'https://www.youtube.com/@JuufuuteiRaden',
        name: 'Juufuutei Raden',
        avatar: 'https://yt3.googleusercontent.com/MrOx47-A0RkLxHN5Wh8stc3SYfbPGNHdJY9AnjD5mRkuKYVeYjxlBSnzKHtqTjDQ3Lm_MRCjcA=s176-c-k-c0x00ffffff-no-rj',
    },
    {
        id: 'UC1iA6_NT4mtAcIII6ygrvCw',
        url: 'https://www.youtube.com/@TodorokiHajime',
        name: 'Todoroki Hajime',
        avatar: 'https://yt3.googleusercontent.com/vMM_SKbkipyDVJkUYPPWlQkgThE1rXMSh7hkhqvC_Qs-iTigfyKW23OfLH5U1HFTZIcsHR2Z=s176-c-k-c0x00ffffff-no-rj',
    },
];

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

export default async function Home() {
    const totalSubscribersCount = await fetchTotalSubscriberCount();
    const percentage = Math.min(
        (totalSubscribersCount / GOAL_COUNT) * 100,
        100
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
                    {CHANNELS.map((channel) => (
                        <a key={channel.id} href={channel.url} target="_blank">
                            <div className={styles['channel-container']}>
                                <Image
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
