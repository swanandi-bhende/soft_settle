import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { noise } from '@chainsafe/libp2p-noise';
import { yamux } from '@chainsafe/libp2p-yamux';
import all from 'it-all';
import { Uint8ArrayList } from 'uint8arraylist'; // for type checking

export const createNode = async () => {
  const node = await createLibp2p({
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/0']
    },
    transports: [tcp()],
    connectionEncrypters: [noise()],
    streamMuxers: [yamux()]
  });

  await node.start();

  const [addr] = node.getMultiaddrs();
  console.log('Soft-Settle P2P Node started:', addr?.toString());

  node.handle('/soft-settle/1.0.0', async (stream) => {
    try {
      // Collect all chunks from the stream
      const chunks = await all(stream); // Uint8ArrayList[]
      
      // Convert all chunks to Uint8Array before concatenating
      const buffers = chunks.map((chunk) =>
        chunk instanceof Uint8ArrayList ? chunk.slice() : chunk
      );

      const data = Buffer.concat(buffers).toString('utf8');
      const message = JSON.parse(data);

      console.log('[P2P] Received state update:', message);

      // TODO:
      // - Verify EIP-712 signature
      // - Validate Nitrolite state transition
      // - Enforce <100ms latency path

    } catch (err) {
      console.error('[P2P] Stream handling error:', err);
    } finally {
      await stream.close();
    }
  });

  return node;
};

// Start node
createNode().catch(console.error);
