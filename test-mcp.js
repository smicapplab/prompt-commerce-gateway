import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

const client = new Client({ name: 'test', version: '1.0' }, { capabilities: {} });
const transport = new SSEClientTransport(new URL('http://localhost:3000/sse/fruitie'), {
  requestInit: { headers: { 'x-gateway-key': 'your-static-key' } } // Need to get the right key
});

async function run() {
  await client.connect(transport);
  const result = await client.callTool({
    name: 'create_order',
    arguments: { items: [{ product_id: 1, quantity: 1 }], confirm: true }
  });
  console.log('Result:', result);
  await client.close();
}
run().catch(console.error);
