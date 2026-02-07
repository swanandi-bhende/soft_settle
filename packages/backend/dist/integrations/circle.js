"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerDeficitPayout = triggerDeficitPayout;
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const CIRCLE_API_URL = 'https://api-sandbox.circle.com/v1';
const API_KEY = process.env.CIRCLE_API_KEY;
/**
 * Direct API implementation to bypass SDK type errors.
 * This handles the full Payout workflow: Create Recipient -> Create Payout.
 */
async function triggerDeficitPayout(destinationAddress, amount) {
    try {
        // Step 1: Create a Recipient (Address Book Entry)
        const recipientResponse = await fetch(`${CIRCLE_API_URL}/addressBook/recipients`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                idempotencyKey: crypto_1.default.randomUUID(),
                chain: 'POLY', // Polygon
                address: destinationAddress,
                metadata: {
                    nickname: `SoftSettle_${destinationAddress.slice(0, 4)}`,
                    email: "payouts@softsettle.io"
                }
            })
        });
        const recipientData = await recipientResponse.json();
        if (!recipientResponse.ok) {
            throw new Error(`Recipient Error: ${recipientData.message || recipientResponse.statusText}`);
        }
        const recipientId = recipientData.data.id;
        // Step 2: Create the Payout
        const payoutResponse = await fetch(`${CIRCLE_API_URL}/payouts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                idempotencyKey: crypto_1.default.randomUUID(),
                destination: {
                    type: 'address_book',
                    id: recipientId,
                },
                amount: {
                    amount: amount,
                    currency: 'USD'
                },
            })
        });
        const payoutData = await payoutResponse.json();
        if (!payoutResponse.ok) {
            throw new Error(`Payout Error: ${payoutData.message || payoutResponse.statusText}`);
        }
        console.log("Successfully triggered Circle Payout:", payoutData.data.id);
        return payoutData.data;
    }
    catch (error) {
        console.error("Circle Integration Failure:", error.message);
        throw error;
    }
}
