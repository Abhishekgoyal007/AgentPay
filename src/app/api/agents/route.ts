import { NextResponse } from 'next/server';

// Mock agents data
const agents = [
    {
        id: 'agent-001',
        name: 'My First Agent',
        description: 'A versatile AI agent for text and image generation',
        status: 'online',
        walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
        balance: 79.33,
        createdAt: '2024-12-01T10:00:00Z',
        stats: {
            totalEarnings: 124.56,
            totalSpent: 45.23,
            servicesProvided: 1847,
            servicesConsumed: 423,
            rating: 4.8,
            ratingCount: 156,
        },
    },
];

export async function GET() {
    return NextResponse.json({
        agents,
        total: agents.length,
    });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const newAgent = {
            id: `agent-${Date.now()}`,
            name: body.name || 'New Agent',
            description: body.description || '',
            status: 'offline',
            walletAddress: body.walletAddress || '0x...',
            balance: 0,
            createdAt: new Date().toISOString(),
            stats: {
                totalEarnings: 0,
                totalSpent: 0,
                servicesProvided: 0,
                servicesConsumed: 0,
                rating: 0,
                ratingCount: 0,
            },
        };

        // In production, save to database
        agents.push(newAgent);

        return NextResponse.json({
            success: true,
            agent: newAgent,
        });
    } catch (error) {
        console.error('Error creating agent:', error);
        return NextResponse.json(
            { error: 'Failed to create agent' },
            { status: 400 }
        );
    }
}
