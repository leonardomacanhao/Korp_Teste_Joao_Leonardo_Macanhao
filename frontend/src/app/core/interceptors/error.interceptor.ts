import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError(error => {
      let errorMessage = 'Ocorreu um erro inesperado';

      if (error.status === 0) {
        errorMessage = 'Serviço indisponível. Verifique se o backend está rodando.';
      } else if (error.status === 502) {
        errorMessage = 'Falha na comunicação entre serviços. Tente novamente.';
      } else if (error.status === 400) {
        errorMessage = error.error?.message || 'Requisição inválida';
      }

      console.error('Erro HTTP:', error);
      alert(errorMessage);

      return throwError(() => error);
    })
  );
};