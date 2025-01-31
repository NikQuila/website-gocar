import { getClient } from '../hooks/useClient';

export default async function Home() {
  const client = await getClient();

  if (!client) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <h1 className='text-xl'>Cliente no encontrado</h1>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen p-8'>
      <img src={client.logo} alt={client.name} className='h-20 w-auto mb-8' />
      <h1 className='text-4xl font-bold mb-4'>Bienvenido a {client.name}</h1>
      <p className='text-xl text-gray-600'>{client.seo.description}</p>
    </div>
  );
}
