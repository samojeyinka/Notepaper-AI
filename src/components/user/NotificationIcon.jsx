import { Link } from 'react-router-dom'
import { useNotifications } from '../../context/NotificationsContext';

const NotificationIcon = () => {
      const { unreadCount } = useNotifications();
  return (
    <Link to={'/lockedin/notifications'} className="relative w-5 h-5 md:w-10 md:h-10 rounded-full bg-white flex items-center justify-center text-slate-600 hover:text-purple-500 transition-colors">
          <span className="material-icons-round text-[16px]">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[9px] md:min-w-[18px] h-[12px] md:h-[18px] px-1 bg-red-500 text-white text-[8px] md:text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>
  )
}

export default NotificationIcon