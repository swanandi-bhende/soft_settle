// packages/frontend/pages/register.tsx
import { useState } from 'react';
import { ethers } from 'ethers';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';

const REGISTER_AGENT = gql`
  mutation RegisterAgent($domain: String!, $desc: String!, $sig: String!) {
    registerAgent(domain: $domain, description: $desc, signature: $sig) {
      ensDomain
    }
  }
`;

export default function RegisterAgent() {
  const [domain, setDomain] = useState('');

  const [register, { loading, error }] = useMutation(REGISTER_AGENT);

  const handleRegister = async () => {
    if (!domain) return alert('Enter an ENS domain');

    if (!(window as any).ethereum) {
      alert('MetaMask not found');
      return;
    }

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();

    const message = `Register Soft-Settle Agent: ${domain}`;
    const signature = await signer.signMessage(message);

    await register({
      variables: {
        domain,
        desc: 'AI Agent',
        sig: signature,
      },
    });

    alert('Agent Registered on ENS & Soft-Settle Registry!');
  };

  return (
    <div className="max-w-lg mx-auto mt-32 p-10 bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-xl border border-gray-700">
      <h2 className="text-3xl font-bold mb-8 text-white">Register AI Agent</h2>

      <input
        className="w-full p-4 mb-6 bg-gray-900 text-white border border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 transition duration-200"
        placeholder="agent-name.eth"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
      />

      <button
        onClick={handleRegister}
        disabled={loading}
        className="w-full py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition duration-300 font-medium"
      >
        {loading ? 'Registering...' : 'Sign & Register'}
      </button>

      {error && (
        <p className="mt-4 text-red-500 text-sm">
          Error: {error.message}
        </p>
      )}
    </div>
  );
}