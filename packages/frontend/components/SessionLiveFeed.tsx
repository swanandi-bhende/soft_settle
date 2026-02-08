// packages/frontend/components/SessionLiveFeed.tsx
'use client';

import { gql } from '@apollo/client';
import { useSubscription } from '@apollo/client/react';

const SESSION_UPDATED = gql`
  subscription OnSessionUpdated($sessionId: String!) {
    sessionUpdated(sessionId: $sessionId) {
      id
      balance
      status
      nonce
    }
  }
`;

interface SessionUpdatedData {
  sessionUpdated: {
    id: string;
    balance: number;
    status: 'active' | 'closed' | 'disputed';
    nonce: number;
  };
}

interface SessionLiveFeedProps {
  sessionId: string;
}

export default function SessionLiveFeed({
  sessionId,
}: SessionLiveFeedProps) {
  const { data, loading } = useSubscription<SessionUpdatedData>(
    SESSION_UPDATED,
    {
      variables: { sessionId },
      skip: !sessionId,
    }
  );

  if (loading) {
    return (
      <div className="animate-pulse text-gray-400 text-lg">
        Connecting to P2P Relay...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-gray-400 text-lg">
        Waiting for session events...
      </div>
    );
  }

  const { balance, status, nonce } = data.sessionUpdated;

  return (
    <div className="p-6 bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-2xl shadow-lg text-white font-mono">
      <div className="flex justify-between text-base text-gray-300 mb-4">
        <span>Status: {status}</span>
        <span>Nonce: {nonce}</span>
      </div>

      <div className="text-3xl font-bold">
        Accumulated: {balance} USDC
      </div>

      <div className="w-full bg-gray-700 h-3 mt-6 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-green-500 to-blue-500 h-full transition-all duration-500"
          style={{
            width: `${Math.min((balance / 10) * 100, 100)}%`,
          }}
        />
      </div>
    </div>
  );
}