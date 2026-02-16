import cacheEvents from './cacheEvents.js';
import { deleteByPattern } from '../utils/cache.js';
import logger from '../config/logger.js';



//not much granularity here, as we are not experiencing any heavy usage anyways.......
cacheEvents.on('USER_UPDATED', async (version="v1") => {
//logger.info("USER UPDATED EVENT FIRED HANDLED");
  await deleteByPattern(`admin:${version}:users:*`);  //as admin dashboard list users, so updates like changes in email/username should reflect there
//  await deleteByPattern(`admin:${version}:user:${userId}`);
  await deleteByPattern(`admin:${version}:stats:*`);  //updates such as chnaging user's role should reflect on stats in admin dashboard, example number of admins should change if a user became an admin(role update)
  await deleteByPattern(`admin:${version}:logs:*`); //user updates, ...like deleting a user should also invalidate logs cache
});

cacheEvents.on('TASK_UPDATED', async (userId, version="v1") => {
//redis returrn the number of keys invalidated, if not deleted anything due to key miss, returns 0.
  await deleteByPattern(`users:${version}:tasks:${userId}:*`); //so that if a user fetches his own tasks, it should be up to date
  await deleteByPattern(`admin:${version}:tasks:*`);  //so that admin dashboard will show the new/updated tasks
  await deleteByPattern(`admin:${version}:stats:*`);  //so that stats like number of tasks shown in admin dashboard reflect the new count.
  await deleteByPattern(`admin:${version}:logs:*`); //so that if an admin delete a task, all other admins should see the tasks which was deleted....
});
