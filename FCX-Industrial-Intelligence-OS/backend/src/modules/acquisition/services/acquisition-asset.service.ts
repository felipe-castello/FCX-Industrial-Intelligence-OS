import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class AcquisitionAssetService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveAssetId(assetId?: string, externalId?: string) {
    if (assetId) {
      const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
      if (asset) return asset.id;
    }

    if (externalId) {
      const asset = await this.prisma.asset.findFirst({ where: { nome: externalId } });
      if (asset) return asset.id;
    }

    return undefined;
  }
}
