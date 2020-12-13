import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheMiddleware } from './cache.middleware';
import { ProxyController } from './proxy-controller';
import { ProxyService } from './proxy/proxy.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [ProxyController],
  providers: [ProxyService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CacheMiddleware).forRoutes('*');
  }
}
