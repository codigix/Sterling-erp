const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/common/NotificationBell.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const changes = [
  {
    name: 'Add debugging to fetchNotifications',
    old: `  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await axios.get(\`/alerts/user/\${user.id}\`);
      const notifs = response.data || [];
      setNotifications(notifs);
      
      const unread = notifs.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };`,
    new: `  const fetchNotifications = async () => {
    if (!user?.id) {
      console.log('[NotificationBell] User ID not available:', user);
      return;
    }
    
    try {
      setLoading(true);
      console.log('[NotificationBell] Fetching for user:', user.id);
      const response = await axios.get(\`/alerts/user/\${user.id}\`);
      const notifs = Array.isArray(response.data) ? response.data : [];
      console.log('[NotificationBell] Got', notifs.length, 'notifications');
      setNotifications(notifs);
      
      const unread = notifs.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('[NotificationBell] Error:', error.message);
    } finally {
      setLoading(false);
    }
  };`
  },
  {
    name: 'Change polling interval to 5 seconds',
    old: `    const interval = setInterval(fetchNotifications, 30000);`,
    new: `    const interval = setInterval(fetchNotifications, 5000);`
  }
];

let applied = 0;
changes.forEach(change => {
  if (content.includes(change.old)) {
    content = content.replace(change.old, change.new);
    console.log(`✓ Applied: ${change.name}`);
    applied++;
  } else {
    console.log(`✗ Could not find: ${change.name}`);
  }
});

fs.writeFileSync(filePath, content, 'utf8');
console.log(`\n✓ Updated ${applied}/${changes.length} changes`);
