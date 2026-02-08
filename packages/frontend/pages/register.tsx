import { useState } from 'react';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { gql, useMutation } from '@apollo/client';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Header from '../components/Header';

const REGISTER_AGENT = gql`
  mutation RegisterAgent($domain: String!, $desc: String!, $sig: String!) {
    registerAgent(domain: $domain, description: $desc, signature: $sig) {
      ensDomain
    }
  }
`;

const steps = [
  { id: 1, label: 'Connect Wallet' },
  { id: 2, label: 'Agent Details' },
  { id: 3, label: 'Review & Sign' },
];

export default function RegisterAgent() {
  const { address, isConnected } = useAccount();
  const [currentStep, setCurrentStep] = useState(1);
  const [domain, setDomain] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [register, { loading }] = useMutation(REGISTER_AGENT);

  const canProceed = () => {
    if (currentStep === 1) return isConnected;
    if (currentStep === 2) return Boolean(domain && description);
    return true;
  };

  const handleNext = () => {
    if (canProceed() && currentStep < 3) {
      setCurrentStep((s) => s + 1);
      setError('');
    }
  };

  const handleRegister = async () => {
    if (!domain) {
      setError('Enter an ENS domain');
      return;
    }

    if (!(window as any).ethereum) {
      setError('MetaMask not found');
      return;
    }

    try {
      // Ensure the dapp has access to accounts; if the user hasn't connected
      // programmatically, request account access which will trigger the wallet UI.
      if (!isConnected) {
        try {
          await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        } catch (reqErr: any) {
          setError('Please connect your wallet to continue');
          return;
        }
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      const message = `Register Soft-Settle Agent: ${domain}`;
      let signature: string;
      try {
        signature = await signer.signMessage(message);
      } catch (sigErr: any) {
        // User rejected the signature or wallet blocked the request
        setError('Signature request was rejected. Please confirm in your wallet.');
        return;
      }

      await register({
        variables: {
          domain,
          desc: description,
          sig: signature,
        },
      });

      setSuccess(true);
      setError('');

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } catch (err: any) {
      // Better error messaging for common provider errors
      const msg = err?.message || err?.toString?.() || 'Registration failed';
      setError(msg.includes('4100') ? 'Wallet access not authorized' : msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <Header />

      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-12 relative">
            <div className="flex justify-between mb-8 relative">
              {steps.map((step, idx) => (
                <div key={step.id} className="flex-1 flex flex-col items-center relative">
                  <motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-3 transition-all duration-300 ${
                      step.id <= currentStep
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                    whileHover={step.id <= currentStep ? { scale: 1.1 } : undefined}
                  >
                    {step.id}
                  </motion.div>

                  <span
                    className={`text-sm font-medium transition-colors duration-300 ${
                      step.id <= currentStep ? 'text-blue-400' : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>

                  {idx < steps.length - 1 && (
                    <div
                      className={`absolute w-16 h-1 top-6 left-1/2 ml-6 transition-all duration-300 ${
                        step.id < currentStep
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                          : 'bg-slate-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                animate={{ width: `${(currentStep / 3) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Form Card */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-700 backdrop-blur-sm"
          >
            {/* Step 1 */}
            {currentStep === 1 && (
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Connect Your Wallet
                </h2>
                <p className="text-slate-400 mb-8">
                  You'll need to sign a message to register your AI agent
                </p>

                {isConnected ? (
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-3">
                    <span className="w-3 h-3 bg-green-400 rounded-full" />
                    <span className="text-green-300 font-medium">
                      Connected: {address?.slice(0, 6)}…{address?.slice(-4)}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <ConnectButton label="Connect Wallet" showBalance={false} />
                  </div>
                )}
              </div>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Agent Details</h2>
                <p className="text-slate-400 mb-8">
                  Register your AI agent on ENS with a description
                </p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      ENS Domain Name
                    </label>
                    <input
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="my-agent.eth"
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Agent Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Review & Sign</h2>

                {error && (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm mb-4">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold"
                >
                  {loading ? 'Signing & Registering...' : 'Sign & Register Agent'}
                </button>
              </div>
            )}

            {!success && (
              <div className="flex gap-4 mt-8 pt-8 border-t border-slate-700">
                <button
                  disabled={currentStep === 1}
                  onClick={() => setCurrentStep((s) => s - 1)}
                  className="flex-1 py-3 rounded-lg border border-slate-600 text-slate-300"
                >
                  Previous
                </button>

                {currentStep < 3 && (
                  <button
                    disabled={!canProceed()}
                    onClick={handleNext}
                    className="flex-1 py-3 rounded-lg bg-blue-600 text-white"
                  >
                    Next
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
