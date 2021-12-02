import { NestFactory } from '@nestjs/core';
import * as faker from 'faker';
import { OrderService } from '../order/order.service';
import { AppModule } from '../app.module';
import { OrderItemService } from '../order/order-item.service';

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //최댓값도 포함, 최솟값도 포함
}

(async () => {
  const app = await NestFactory.createApplicationContext(AppModule);

  const orderService = app.get(OrderService);
  const orderItemService = app.get(OrderItemService);

  for (let i = 0; i < 30; i++) {
    const order = await orderService.save({
      user_id: getRandomIntInclusive(2, 31),
      code: faker.lorem.slug(2),
      ambassador_email: faker.internet.email(),
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
      email: faker.internet.email(),
      complete: true,
    });

    for (let j = 0; j < getRandomIntInclusive(1, 5); j++) {
      await orderItemService.save({
        order,
        product_title: faker.lorem.words(2),
        price: getRandomIntInclusive(10, 100),
        quantity: getRandomIntInclusive(1, 5),
        admin_revenue: getRandomIntInclusive(10, 100),
        ambassador_revenue: getRandomIntInclusive(1, 10),
      });
    }
  }

  process.exit();
})();
