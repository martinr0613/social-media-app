import { Heart, MessageCircle, User2 } from 'lucide-react';
import { NotificationData } from '../../../lib/types';
import { NotificationType } from '@prisma/client';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import UserAvatar from '@/components/UserAvatar';

interface NotificationProps {
    notification: NotificationData
}

export default function Notification(
    {notification}: NotificationProps
) {

  const notificationTypeMap: 
  Record<NotificationType, {message: string, icon: JSX.Element, href: string}> = 
  {
    FOLLOW: {
        message: `${notification.issuer.displayName} started following you`,
        icon: <User2 className="size-7 text-primary fill-primary"/>,
        href: `/users/${notification.issuer.username}`
    },
    COMMENT: {
        message: `${notification.issuer.displayName} commented on your post`,
        icon: <MessageCircle className="size-7 text-primary fill-primary" />,
        href: `/posts/${notification.postId}`
    },
    LIKE: {
        message: `${notification.issuer.displayName} liked your post`,
        icon: <Heart className="size-7 text-red-500 fill-red-500" />,
        href: `/posts/${notification.postId}`
    }
  }

  const {message, icon, href} = notificationTypeMap[notification.type]

  return (
    <Link href={href} className="block">
        <article className={cn(
            "flex gap-3 rounded-2xl bg-card p-5 shadow-sm transition-colors hover:bg-card/70",
            !notification.read && "bg-primary/10"
        )}>
            <div className="my-1"> {icon} </div>
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <UserAvatar avatarUrl={notification.issuer.avatarUrl}
                                size={36}
                    />
                    <span className="font-bold">
                        {notification.issuer.displayName}
                    </span>
                </div>
                <div>
                    <span> {message} </span>
                </div>
                {notification.post && (
                    <div className="line-clamp-3 white-space-pre-line text-muted-foreground">
                        {notification.post.content}
                    </div>
                )}
            </div>
        </article>
    </Link>
  )
}
