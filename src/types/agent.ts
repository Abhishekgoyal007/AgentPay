// Core types for AgentPay

export interface Agent {
    id: string;
    name: string;
    description: string;
    ownerAddress: string;
    walletAddress: string;
    avatar?: string;
    status: AgentStatus;
    createdAt: Date;
    updatedAt: Date;
    stats: AgentStats;
}

export type AgentStatus = 'online' | 'offline' | 'busy';

export interface AgentStats {
    totalEarnings: number;
    totalSpent: number;
    servicesProvided: number;
    servicesConsumed: number;
    rating: number;
    ratingCount: number;
}

export interface Service {
    id: string;
    agentId: string;
    name: string;
    description: string;
    category: ServiceCategory;
    pricePerRequest: number; // in MOVE
    pricingModel: PricingModel;
    endpoint?: string;
    inputSchema?: Record<string, unknown>;
    outputSchema?: Record<string, unknown>;
    status: ServiceStatus;
    stats: ServiceStats;
    createdAt: Date;
    updatedAt: Date;
}

export type ServiceCategory =
    | 'ai-generation'
    | 'data-processing'
    | 'translation'
    | 'analysis'
    | 'api-proxy'
    | 'computation'
    | 'storage'
    | 'other';

export type PricingModel =
    | 'per-request'
    | 'per-token'
    | 'per-mb'
    | 'per-second';

export type ServiceStatus = 'active' | 'paused' | 'deprecated';

export interface ServiceStats {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalRevenue: number;
    avgResponseTime: number; // in ms
}

export interface Transaction {
    id: string;
    fromAgentId: string;
    toAgentId: string;
    serviceId: string;
    amount: number; // in MOVE
    status: TransactionStatus;
    txHash?: string;
    requestPayload?: Record<string, unknown>;
    responsePayload?: Record<string, unknown>;
    createdAt: Date;
    completedAt?: Date;
}

export type TransactionStatus =
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'refunded';

export interface PaymentRequest {
    serviceId: string;
    amount: number;
    payTo: string;
    network: string;
    expiresAt: Date;
}

export interface ServiceRequest {
    serviceId: string;
    input: Record<string, unknown>;
    paymentSignature?: string;
}

export interface ServiceResponse {
    success: boolean;
    output?: Record<string, unknown>;
    error?: string;
    transactionId?: string;
}

// Marketplace types
export interface MarketplaceFilters {
    category?: ServiceCategory;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sortBy?: 'price' | 'rating' | 'popularity';
    sortOrder?: 'asc' | 'desc';
    search?: string;
}

export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}
