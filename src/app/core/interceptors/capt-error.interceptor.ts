import { HttpInterceptorFn } from '@angular/common/http';

export const captErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
