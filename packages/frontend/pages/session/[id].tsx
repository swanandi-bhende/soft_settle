// packages/frontend/pages/session/[id].tsx
import { useRouter } from 'next/router';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

import SessionLiveFeed from '@/components/SessionLiveFeed';

const GET_SESSION = gql`
  query GetSession($id: String!) {
    monitorSession(sessionId: $id) {
      id
      consumerEns
      providerEns
      deposit
      status
    }
  }
`;

export default function SessionDetail() {
  const router = useRouter();
  const { id } = router.query;

  const { data, loading, error } = useQuery(GET_SESSION, {
    variables: { id },
    skip: !id,
  });

  if (loading)
    return <div className="p-20 text-center text-gray-400">Loading Session Data...</div>;

  if (error)
    return <div className="p-20 text-center text-red-500">Failed to load session</div>;

  const session = data.monitorSession;

  return (
    <div className="max-w-5xl mx-auto py-16 px-6 bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold text-white">Session Overview</h1>
        <span
          className={`px-5 py-2 rounded-full text-sm font-medium ${
            session.status === 'active'
              ? 'bg-green-900/30 text-green-400'
              : 'bg-red-900/30 text-red-400'
          }`}
        >
          {session.status.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
        <div className="space-y-6">
          <p className="text-gray-300 text-lg">
            Consumer:{' '}
            <span className="text-white font-mono">
              {session.consumerEns}
            </span>
          </p>
          <p className="text-gray-300 text-lg">
            Provider:{' '}
            <span className="text-white font-mono">
              {session.providerEns}
            </span>
          </p>
          <p className="text-gray-300 text-lg">
            Locked Deposit:{' '}
            <span className="text-white font-bold">
              {session.deposit} USDC
            </span>
          </p>
        </div>

        <SessionLiveFeed sessionId={id as string} />
      </div>

      <div className="bg-gray-800/50 backdrop-blur-md p-8 rounded-2xl border border-gray-700 shadow-lg">
        <h4 className="font-bold text-xl mb-4 text-white">Audit Reports</h4>
        <button className="text-blue-400 hover:text-blue-300 transition duration-200 text-sm font-medium">
          Export Session Logs (CSV)
        </button>
      </div>
    </div>
  );
}