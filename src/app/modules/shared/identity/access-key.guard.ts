import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { accessKeyLink } from '../core/routes/app-paths';
import { AccessKeyService } from './access-key.service';

/** Sem chave guardada, a rota vai para a tela de chave. Se a chave guardada não valer, o interceptor cuida. */
export const accessKeyGuard: CanActivateFn = () =>
  inject(AccessKeyService).hasKey() || inject(Router).createUrlTree(accessKeyLink);
