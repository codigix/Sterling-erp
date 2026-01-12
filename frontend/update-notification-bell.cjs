const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/common/NotificationBell.jsx');
let content = fs.readFileSync(filePath, 'utf8');

console.log('Updating NotificationBell...');

content = content.replace(
  'const interval = setInterval(fetchNotifications, 30000);',
  'const interval = setInterval(fetchNotifications, 5000);'
);

content = content.replace(
  `  const fetchNotifications = async () => {
    if (!user?.id) return;`,
  `  const fetchNotifications = async () => {
    if (!user?.id) {
      console.log('[NotificationBell] User not available');
      return;
    }`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ Updated NotificationBell - faster polling (5s) and better logging');
