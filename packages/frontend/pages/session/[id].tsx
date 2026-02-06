import { useRouter } from 'next/router';
import { useQuery, useMutation, gql } from '@apollo/client';
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
  const { data, loading } = useQuery(GET_SESSION, { variables: { id } });

  if (loading) return <div className="p-20 text-center">Loading Session Data...</div>;

  const session = data.monitorSession;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Session Overview</h1>
        <span className={`px-4 py-1 rounded-full text-sm ${session.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {session.status.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="space-y-4">
          <p className="text-gray-500">Consumer: <span className="text-black font-mono">{session.consumerEns}</span></p>
          <p className="text-gray-500">Provider: <span className="text-black font-mono">{session.providerEns}</span></p>
          <p className="text-gray-500">Locked Deposit: <span className="text-black font-bold">{session.deposit} USDC</span></p>
        </div>
        <SessionLiveFeed sessionId={id as string} />
      </div>

      <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300">
        <h4 className="font-bold mb-2">Audit Reports</h4>
        <button className="text-blue-600 hover:underline">Export Session Logs (CSV)</button>
      </div>
    </div>
  );
}