// packages/backend/src/integrations/ipfs.ts
export async function logToIPFS(data: any): Promise<string> {
  console.log("[IPFS] Pinning data:", data);
  return "QmFakeHashForDemo"; // placeholder hash
}
