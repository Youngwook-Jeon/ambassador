import { NestFactory } from '@nestjs/core';
import { RedisService } from '../shared/redis.service';
import { AppModule } from '../app.module';
import { UserService } from '../user/user.service';
import { User } from '../user/user';

(async () => {
  const app = await NestFactory.createApplicationContext(AppModule);

  const redisService = app.get(RedisService);
  const userService = app.get(UserService);

  const ambassadors: User[] = await userService.find({
    is_ambassador: true,
    relations: ['orders', 'orders.order_items'],
  });

  const client = redisService.getClient();

  for (let i = 0; i < ambassadors.length; i++) {
    await client.zadd('rankings', ambassadors[i].revenue, ambassadors[i].name);
  }

  process.exit();
})();
