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

    // Ensure wallet exists
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
    <div className="max-w-md mx-auto mt-20 p-8 border rounded-xl shadow-2xl">
      <h2 className="text-2xl font-bold mb-6">Register AI Agent</h2>

      <input
        className="w-full p-2 mb-4 border rounded"
        placeholder="agent-name.eth"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
      />

      <button
        onClick={handleRegister}
        disabled={loading}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Registering…' : 'Sign & Register'}
      </button>

      {error && (
        <p className="mt-4 text-red-600 text-sm">
          Error: {error.message}
        </p>
      )}
    </div>
  );
}
