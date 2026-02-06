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
      skip: !sessionId, // 👈 important safety
    }
  );

  if (loading) {
    return (
      <div className="animate-pulse text-gray-400">
        Connecting to P2P Relay...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-gray-500">
        Waiting for session events…
      </div>
    );
  }

  const { balance, status, nonce } = data.sessionUpdated;

  return (
    <div className="p-4 border rounded-lg bg-gray-900 text-green-400 font-mono">
      <div className="flex justify-between">
        <span>Status: {status}</span>
        <span>Nonce: {nonce}</span>
      </div>

      <div className="text-2xl mt-2">
        Accumulated: {balance} USDC
      </div>

      {/* Visual progress bar */}
      <div className="w-full bg-gray-700 h-2 mt-4 rounded">
        <div
          className="bg-green-500 h-full transition-all duration-300"
          style={{
            width: `${Math.min((balance / 10) * 100, 100)}%`,
          }}
        />
      </div>
    </div>
  );
}
