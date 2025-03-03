import { headers } from 'next/headers';

export async function getClient() {
  try {
    const headersList = headers();
    const clientData = headersList.get('x-client-data');
    const client = clientData ? JSON.parse(clientData) : null;

    console.log('Client data in getClient:', {
      clientData,
      favicon: client?.favicon,
      domain: client?.domain,
    });

    return client;
  } catch (error) {
    console.error('Error getting client:', error);
    return null;
  }
}
