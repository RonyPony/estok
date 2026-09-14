export interface SessionUser { id: string; firstName: string; lastName: string; email: string; }
export interface SessionBusiness { id: string; name: string; currency: string; country: string; timeZone: string; }
export interface Session { accessToken: string; user: SessionUser; business: SessionBusiness; permissions: string[]; }
export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest extends LoginRequest { firstName: string; lastName: string; businessName: string; country: string; currency: string; }
export interface RegistrationResponse { status: 'pending_review'; message: string; }
export interface PagedResult<T> { items: T[]; pageNumber: number; pageSize: number; totalItems: number; totalPages: number; }
