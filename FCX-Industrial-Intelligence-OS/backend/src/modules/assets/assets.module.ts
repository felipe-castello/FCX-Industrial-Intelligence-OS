import { Module } from '@nestjs/common';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { AssetRegistryService } from './asset-registry.service';
import { GatewaysController, SensorsController, SitesController } from './asset-registry.controllers';
import { ClientsController, DevicesController } from './safe-registry.controllers';
import { SafeRegistryService } from './safe-registry.service';

@Module({
  controllers: [AssetsController, SitesController, SensorsController, GatewaysController, ClientsController, DevicesController],
  providers: [AssetsService, AssetRegistryService, SafeRegistryService],
  exports: [AssetsService, AssetRegistryService, SafeRegistryService],
})
export class AssetsModule {}
