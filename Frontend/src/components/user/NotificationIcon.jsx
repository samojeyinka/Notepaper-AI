import { Link } from 'react-router-dom'
import { useNotifications } from '../../context/NotificationsContext';

const NotificationIcon = () => {
  const { unreadCount } = useNotifications();
  return (
    <Link
      to={'/lockedin/notifications'}
      className="relative w-9 h-9 md:w-10 md:h-10  bg-white ring-1 ring-stone-200 flex items-center justify-center text-stone-600 hover:text-plum-700 hover:ring-plum-300 transition-all"
      aria-label="Notifications"
    >
      <span className="material-icons-round text-[19px]">notifications</span>
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-rose-600 text-white text-[9px] font-bold  flex items-center justify-center leading-none">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  )
}

export default NotificationIcon
