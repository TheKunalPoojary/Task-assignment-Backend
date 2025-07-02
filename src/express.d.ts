import { OrganizationDocument } from './models/organization.model';

declare global {
  namespace Express {
    interface Request {
      organization?: OrganizationDocument;
    }
  }
} 