import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from './audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly audit: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Record<string, any>>();
    const method = String(request.method || 'GET').toUpperCase();
    const action = ({ POST: 'create', PUT: 'update', PATCH: 'update', DELETE: 'delete' } as Record<string, string>)[method];

    return next.handle().pipe(tap(() => {
      if (!action || String(request.path || '').startsWith('/auth')) return;
      void this.audit.record({
        userId: request.user?.sub,
        action,
        resource: String(request.path || '/').split('/').filter(Boolean)[0] || 'unknown',
        resourceId: request.params?.id,
        method,
        path: request.originalUrl || request.path,
        ipAddress: request.ip,
      }).catch(() => undefined);
    }));
  }
}
