
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  phone: 'phone',
  name: 'name',
  avatarUrl: 'avatarUrl',
  passwordHash: 'passwordHash',
  googleId: 'googleId',
  role: 'role',
  isEmailVerified: 'isEmailVerified',
  isPhoneVerified: 'isPhoneVerified',
  isActive: 'isActive',
  recoveryCodes: 'recoveryCodes',
  lastLoginAt: 'lastLoginAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  totpSecret: 'totpSecret',
  totpEnabled: 'totpEnabled',
  totpVerifiedAt: 'totpVerifiedAt'
};

exports.Prisma.UserOnboardingScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  accountType: 'accountType',
  companySize: 'companySize',
  primaryUseCase: 'primaryUseCase',
  firstName: 'firstName',
  lastName: 'lastName',
  city: 'city',
  country: 'country',
  profession: 'profession',
  website: 'website',
  businessName: 'businessName',
  planCode: 'planCode',
  billingCycle: 'billingCycle',
  domain: 'domain',
  completed: 'completed',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  provider: 'provider',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  expiresAt: 'expiresAt',
  revoked: 'revoked',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OtpScalarFieldEnum = {
  id: 'id',
  email: 'email',
  phone: 'phone',
  codeHash: 'codeHash',
  expiresAt: 'expiresAt',
  attempts: 'attempts',
  consumed: 'consumed',
  createdAt: 'createdAt'
};

exports.Prisma.AuthLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  provider: 'provider',
  success: 'success',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  createdAt: 'createdAt'
};

exports.Prisma.VerificationTokenScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  email: 'email',
  token: 'token',
  type: 'type',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.RefreshTokenScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  token: 'token',
  userAgent: 'userAgent',
  ipAddress: 'ipAddress',
  revoked: 'revoked',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LoginAttemptScalarFieldEnum = {
  id: 'id',
  email: 'email',
  phone: 'phone',
  userId: 'userId',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  method: 'method',
  success: 'success',
  createdAt: 'createdAt'
};

exports.Prisma.TenantScalarFieldEnum = {
  id: 'id',
  name: 'name',
  domain: 'domain',
  isActive: 'isActive',
  ownerId: 'ownerId',
  subscriptionId: 'subscriptionId',
  aiSuspended: 'aiSuspended',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TenantEventScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  type: 'type',
  payload: 'payload',
  createdAt: 'createdAt'
};

exports.Prisma.TeamScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  name: 'name',
  slug: 'slug',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TeamMemberScalarFieldEnum = {
  id: 'id',
  teamId: 'teamId',
  userId: 'userId',
  role: 'role',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TeamInviteScalarFieldEnum = {
  id: 'id',
  teamId: 'teamId',
  email: 'email',
  role: 'role',
  status: 'status',
  invitedBy: 'invitedBy',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ThemeScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  name: 'name',
  slug: 'slug',
  visibility: 'visibility',
  description: 'description',
  thumbnail: 'thumbnail',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ThemeVersionScalarFieldEnum = {
  id: 'id',
  themeId: 'themeId',
  version: 'version',
  status: 'status',
  blueprint: 'blueprint',
  tokens: 'tokens',
  settings: 'settings',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  publishedAt: 'publishedAt'
};

exports.Prisma.ThemeAssetScalarFieldEnum = {
  id: 'id',
  themeId: 'themeId',
  versionId: 'versionId',
  type: 'type',
  name: 'name',
  url: 'url',
  meta: 'meta',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MediaAssetScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  url: 'url',
  filename: 'filename',
  fileHash: 'fileHash',
  fileSize: 'fileSize',
  mediaType: 'mediaType',
  mimeType: 'mimeType',
  width: 'width',
  height: 'height',
  alt: 'alt',
  title: 'title',
  tags: 'tags',
  siteId: 'siteId',
  uploadedById: 'uploadedById',
  usageCount: 'usageCount',
  lastUsedAt: 'lastUsedAt',
  source: 'source',
  provider: 'provider',
  prompt: 'prompt',
  negativePrompt: 'negativePrompt',
  model: 'model',
  seed: 'seed',
  aspectRatio: 'aspectRatio',
  thumbnailUrl: 'thumbnailUrl',
  blurhash: 'blurhash',
  dominantColor: 'dominantColor',
  isFavorite: 'isFavorite',
  folder: 'folder',
  metadata: 'metadata'
};

exports.Prisma.SiteScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  logoUrl: 'logoUrl',
  name: 'name',
  slug: 'slug',
  status: 'status',
  designTokens: 'designTokens',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.SiteLayoutScalarFieldEnum = {
  id: 'id',
  siteId: 'siteId',
  header: 'header',
  footer: 'footer',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DomainScalarFieldEnum = {
  id: 'id',
  hostname: 'hostname',
  siteId: 'siteId'
};

exports.Prisma.PageScalarFieldEnum = {
  id: 'id',
  siteId: 'siteId',
  title: 'title',
  slug: 'slug',
  status: 'status',
  reactCode: 'reactCode',
  renderMode: 'renderMode',
  publishedAt: 'publishedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deleted: 'deleted',
  deletedAt: 'deletedAt',
  deletedByUser: 'deletedByUser',
  metadata: 'metadata'
};

exports.Prisma.PreviewTokenScalarFieldEnum = {
  token: 'token',
  pageId: 'pageId',
  expiresAt: 'expiresAt'
};

exports.Prisma.AIBlueprintSnapshotScalarFieldEnum = {
  id: 'id',
  pageId: 'pageId',
  siteId: 'siteId',
  tenantId: 'tenantId',
  blueprint: 'blueprint',
  createdAt: 'createdAt'
};

exports.Prisma.BlueprintScalarFieldEnum = {
  id: 'id',
  pageId: 'pageId',
  siteId: 'siteId',
  tenantId: 'tenantId',
  data: 'data',
  schemaVersion: 'schemaVersion',
  updatedBy: 'updatedBy',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BlueprintHistoryScalarFieldEnum = {
  id: 'id',
  blueprintId: 'blueprintId',
  pageId: 'pageId',
  siteId: 'siteId',
  tenantId: 'tenantId',
  data: 'data',
  schemaVersion: 'schemaVersion',
  createdAt: 'createdAt',
  createdBy: 'createdBy'
};

exports.Prisma.PlanScalarFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name',
  maxSites: 'maxSites',
  maxPages: 'maxPages',
  aiCredits: 'aiCredits',
  teamMembers: 'teamMembers',
  isPublic: 'isPublic',
  createdAt: 'createdAt'
};

exports.Prisma.PlanPricingScalarFieldEnum = {
  id: 'id',
  planCode: 'planCode',
  billingCycle: 'billingCycle',
  currency: 'currency',
  amount: 'amount',
  isActive: 'isActive',
  razorpayPlanId: 'razorpayPlanId',
  stripePriceId: 'stripePriceId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PlanFeatureScalarFieldEnum = {
  id: 'id',
  planCode: 'planCode',
  key: 'key',
  value: 'value',
  type: 'type',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PlanUsageScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  key: 'key',
  used: 'used',
  billingCycle: 'billingCycle',
  periodStart: 'periodStart',
  periodEnd: 'periodEnd',
  updatedAt: 'updatedAt',
  createdAt: 'createdAt'
};

exports.Prisma.SubscriptionScalarFieldEnum = {
  id: 'id',
  tenantActiveId: 'tenantActiveId',
  tenantHistoryId: 'tenantHistoryId',
  userId: 'userId',
  planCode: 'planCode',
  billingCycle: 'billingCycle',
  status: 'status',
  paymentStatus: 'paymentStatus',
  razorpayOrderId: 'razorpayOrderId',
  razorpayPaymentId: 'razorpayPaymentId',
  razorpaySignature: 'razorpaySignature',
  amountPaid: 'amountPaid',
  currency: 'currency',
  startedAt: 'startedAt',
  paidAt: 'paidAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  planId: 'planId'
};

exports.Prisma.SiteSubscriptionScalarFieldEnum = {
  id: 'id',
  siteId: 'siteId',
  tenantId: 'tenantId',
  planCode: 'planCode',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ComplianceAuditScalarFieldEnum = {
  id: 'id',
  siteId: 'siteId',
  tenantId: 'tenantId',
  pageId: 'pageId',
  level: 'level',
  reasons: 'reasons',
  createdAt: 'createdAt'
};

exports.Prisma.SystemNotificationScalarFieldEnum = {
  id: 'id',
  type: 'type',
  title: 'title',
  message: 'message',
  entityType: 'entityType',
  entityId: 'entityId',
  isRead: 'isRead',
  createdAt: 'createdAt'
};

exports.Prisma.SiteSnapshotScalarFieldEnum = {
  id: 'id',
  siteId: 'siteId',
  tenantId: 'tenantId',
  status: 'status',
  version: 'version',
  publishedAt: 'publishedAt',
  createdAt: 'createdAt'
};

exports.Prisma.PageSnapshotScalarFieldEnum = {
  id: 'id',
  siteSnapshotId: 'siteSnapshotId',
  pageId: 'pageId',
  title: 'title',
  slug: 'slug',
  content: 'content',
  createdAt: 'createdAt'
};

exports.Prisma.SiteRenderScalarFieldEnum = {
  id: 'id',
  siteId: 'siteId',
  tenantId: 'tenantId',
  snapshotId: 'snapshotId',
  version: 'version',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.RenderedPageScalarFieldEnum = {
  id: 'id',
  renderId: 'renderId',
  slug: 'slug',
  html: 'html',
  css: 'css',
  js: 'js',
  contentHash: 'contentHash',
  sizeBytes: 'sizeBytes',
  createdAt: 'createdAt'
};

exports.Prisma.SiteDomainScalarFieldEnum = {
  id: 'id',
  siteId: 'siteId',
  tenantId: 'tenantId',
  domain: 'domain',
  status: 'status',
  cnameTarget: 'cnameTarget',
  verifiedAt: 'verifiedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SslCertificateScalarFieldEnum = {
  id: 'id',
  domain: 'domain',
  siteId: 'siteId',
  tenantId: 'tenantId',
  certPath: 'certPath',
  keyPath: 'keyPath',
  issuedAt: 'issuedAt',
  expiresAt: 'expiresAt',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.TrafficEventScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  siteId: 'siteId',
  domain: 'domain',
  path: 'path',
  method: 'method',
  status: 'status',
  country: 'country',
  referrer: 'referrer',
  device: 'device',
  visitorHash: 'visitorHash',
  bucket: 'bucket',
  createdAt: 'createdAt'
};

exports.Prisma.TrafficRollupHourlyScalarFieldEnum = {
  id: 'id',
  siteId: 'siteId',
  hour: 'hour',
  pageViews: 'pageViews',
  visitors: 'visitors',
  bots: 'bots'
};

exports.Prisma.AiEventScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  userId: 'userId',
  siteId: 'siteId',
  pageId: 'pageId',
  action: 'action',
  prompt: 'prompt',
  response: 'response',
  model: 'model',
  tokensIn: 'tokensIn',
  tokensOut: 'tokensOut',
  status: 'status',
  error: 'error',
  createdAt: 'createdAt'
};

exports.Prisma.RateLimitScalarFieldEnum = {
  key: 'key',
  count: 'count',
  resetAt: 'resetAt'
};

exports.Prisma.WorkspaceScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  ownerId: 'ownerId',
  createdAt: 'createdAt'
};

exports.Prisma.WorkspaceMemberScalarFieldEnum = {
  id: 'id',
  workspaceId: 'workspaceId',
  userId: 'userId',
  role: 'role',
  createdAt: 'createdAt'
};

exports.Prisma.AIMessageScalarFieldEnum = {
  id: 'id',
  conversationId: 'conversationId',
  role: 'role',
  content: 'content',
  createdBy: 'createdBy',
  createdAt: 'createdAt'
};

exports.Prisma.AIConversationScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  siteId: 'siteId',
  pageId: 'pageId',
  phase: 'phase',
  context: 'context',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.UserRole = exports.$Enums.UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  TENANT_ADMIN: 'TENANT_ADMIN',
  USER: 'USER'
};

exports.AccountType = exports.$Enums.AccountType = {
  personal: 'personal',
  business: 'business',
  agency: 'agency'
};

exports.CompanySize = exports.$Enums.CompanySize = {
  solo: 'solo',
  small_2_10: 'small_2_10',
  medium_11_50: 'medium_11_50',
  large_50_plus: 'large_50_plus'
};

exports.PrimaryUseCase = exports.$Enums.PrimaryUseCase = {
  company_website: 'company_website',
  landing_pages: 'landing_pages',
  marketing: 'marketing',
  internal_tools: 'internal_tools',
  other: 'other'
};

exports.AuthProvider = exports.$Enums.AuthProvider = {
  PASSWORD: 'PASSWORD',
  GOOGLE: 'GOOGLE',
  OTP: 'OTP'
};

exports.TeamRole = exports.$Enums.TeamRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  VIEWER: 'VIEWER'
};

exports.InviteStatus = exports.$Enums.InviteStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  EXPIRED: 'EXPIRED',
  REVOKED: 'REVOKED'
};

exports.ThemeVisibility = exports.$Enums.ThemeVisibility = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
  SYSTEM: 'SYSTEM'
};

exports.ThemeVersionStatus = exports.$Enums.ThemeVersionStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  DEPRECATED: 'DEPRECATED'
};

exports.MediaType = exports.$Enums.MediaType = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  SVG: 'SVG',
  ICON: 'ICON',
  PDF: 'PDF',
  AUDIO: 'AUDIO'
};

exports.MediaSource = exports.$Enums.MediaSource = {
  UPLOAD: 'UPLOAD',
  AI: 'AI',
  STOCK: 'STOCK',
  ICON: 'ICON'
};

exports.SiteStatus = exports.$Enums.SiteStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED'
};

exports.PageStatus = exports.$Enums.PageStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED'
};

exports.RenderMode = exports.$Enums.RenderMode = {
  BLUEPRINT: 'BLUEPRINT',
  REACT: 'REACT'
};

exports.ComplianceLevel = exports.$Enums.ComplianceLevel = {
  PASS: 'PASS',
  WARN: 'WARN',
  BLOCK: 'BLOCK'
};

exports.SnapshotStatus = exports.$Enums.SnapshotStatus = {
  PUBLISHED: 'PUBLISHED',
  UNPUBLISHED: 'UNPUBLISHED',
  BLOCKED: 'BLOCKED'
};

exports.DomainStatus = exports.$Enums.DomainStatus = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  FAILED: 'FAILED'
};

exports.AIConversationPhase = exports.$Enums.AIConversationPhase = {
  INTERVIEW: 'INTERVIEW',
  READY: 'READY',
  GENERATING: 'GENERATING',
  DONE: 'DONE'
};

exports.Prisma.ModelName = {
  User: 'User',
  UserOnboarding: 'UserOnboarding',
  Session: 'Session',
  Otp: 'Otp',
  AuthLog: 'AuthLog',
  VerificationToken: 'VerificationToken',
  RefreshToken: 'RefreshToken',
  LoginAttempt: 'LoginAttempt',
  Tenant: 'Tenant',
  TenantEvent: 'TenantEvent',
  Team: 'Team',
  TeamMember: 'TeamMember',
  TeamInvite: 'TeamInvite',
  Theme: 'Theme',
  ThemeVersion: 'ThemeVersion',
  ThemeAsset: 'ThemeAsset',
  MediaAsset: 'MediaAsset',
  Site: 'Site',
  SiteLayout: 'SiteLayout',
  Domain: 'Domain',
  Page: 'Page',
  PreviewToken: 'PreviewToken',
  AIBlueprintSnapshot: 'AIBlueprintSnapshot',
  Blueprint: 'Blueprint',
  BlueprintHistory: 'BlueprintHistory',
  Plan: 'Plan',
  PlanPricing: 'PlanPricing',
  PlanFeature: 'PlanFeature',
  PlanUsage: 'PlanUsage',
  Subscription: 'Subscription',
  SiteSubscription: 'SiteSubscription',
  ComplianceAudit: 'ComplianceAudit',
  SystemNotification: 'SystemNotification',
  SiteSnapshot: 'SiteSnapshot',
  PageSnapshot: 'PageSnapshot',
  SiteRender: 'SiteRender',
  RenderedPage: 'RenderedPage',
  SiteDomain: 'SiteDomain',
  SslCertificate: 'SslCertificate',
  TrafficEvent: 'TrafficEvent',
  TrafficRollupHourly: 'TrafficRollupHourly',
  AiEvent: 'AiEvent',
  RateLimit: 'RateLimit',
  Workspace: 'Workspace',
  WorkspaceMember: 'WorkspaceMember',
  AIMessage: 'AIMessage',
  AIConversation: 'AIConversation'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
