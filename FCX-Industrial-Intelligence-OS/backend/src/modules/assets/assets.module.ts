import { Module } from '@nestjs/common';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { AssetRegistryService } from './asset-registry.service';
import { CompaniesController, GatewaysController, SensorsController, SitesController } from './asset-registry.controllers';

@Module({
  controllers: [AssetsController, CompaniesController, SitesController, SensorsController, GatewaysController],
  providers: [AssetsService, AssetRegistryService],
  exports: [AssetsService, AssetRegistryService],
})
export class AssetsModule {}
