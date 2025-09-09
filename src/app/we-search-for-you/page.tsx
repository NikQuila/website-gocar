'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
  Autocomplete,
  AutocompleteItem,
} from '@heroui/react';
import useClientStore from '@/store/useClientStore';
import useCustomerStore from '@/store/useCustomerStore';
import { supabase } from '@/lib/supabase';
import { Brand, Model, LeadTypes } from '@/utils/types';
import SuccessModal from '@/components/ui/SuccessModal';

const WeSearchForYouPage = () => {
  const { client } = useClientStore();
  const { initializeCustomer } = useCustomerStore();
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    brand_id: '',
    model_id: '',
    year_from: '',
    year_to: '',
    max_mileage: '',
    max_owners: '',
    budget: '',
    message: '',
  });

  // Fetch brands on component mount
  useEffect(() => {
    const fetchBrands = async () => {
      const { data: brandsData } = await supabase.from('brands').select('*');
      if (brandsData) setBrands(brandsData);
    };

    fetchBrands();
  }, []);

  // Fetch models when brand changes
  useEffect(() => {
    if (selectedBrandId) {
      const fetchModels = async () => {
        const { data } = await supabase
          .from('models')
          .select('*')
          .eq('brand_id', selectedBrandId);

        if (data) setModels(data);
      };

      fetchModels();
    } else {
      setModels([]);
    }
  }, [selectedBrandId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que el client esté disponible
    if (!client?.id) {
      alert(
        '❌ Error: No se pudo identificar la automotora. Por favor, recarga la página.'
      );
      return;
    }

    // Validar campos requeridos
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.email ||
      !formData.phone
    ) {
      alert(
        '❌ Por favor, completa todos los campos obligatorios (Nombre, Apellido, Email, Teléfono).'
      );
      return;
    }

    if (!formData.brand_id || !formData.model_id) {
      alert('❌ Por favor, selecciona una marca y modelo de vehículo.');
      return;
    }

    try {
      setLoading(true);

      // 1. Create/initialize customer
      const customerResponse = await initializeCustomer({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        client_id: client?.id || '',
      });

      // 2. Create lead with search parameters
      const leadData = {
        client_id: client?.id,
        customer_id: customerResponse.id,
        brand_id: formData.brand_id,
        model_id: parseInt(formData.model_id),
        type: LeadTypes.SEARCH_REQUEST,
        status: 'pending',
        notes: formData.message,
        search_params: {
          year: {
            min: formData.year_from ? parseInt(formData.year_from) : null,
            max: formData.year_to ? parseInt(formData.year_to) : null,
          },
          price: {
            min: null,
            max: formData.budget
              ? parseInt(formData.budget.replace(/\D/g, ''))
              : null,
          },
          mileage: {
            min: null,
            max: formData.max_mileage ? parseInt(formData.max_mileage) : null,
          },
          max_owners: formData.max_owners
            ? parseInt(formData.max_owners)
            : null,
        },
      };

      const { data: leadResult, error: leadError } = await supabase
        .from('leads')
        .insert([leadData])
        .select();

      if (leadError) {
        throw leadError;
      }

      // Clear form after successful submission
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        brand_id: '',
        model_id: '',
        year_from: '',
        year_to: '',
        max_mileage: '',
        max_owners: '',
        budget: '',
        message: '',
      });

      // Mostrar modal de éxito
      setShowSuccessModal(true);
    } catch (error: any) {
      let errorMessage =
        'Hubo un error al enviar tu solicitud. Por favor intenta nuevamente.';

      if (error.code === '23505') {
        errorMessage =
          'Ya existe una solicitud con estos datos. Por favor, verifica la información.';
      } else if (error.message?.includes('email')) {
        errorMessage =
          'Error con el email. Por favor, verifica que el email sea válido.';
      } else if (error.message?.includes('customer')) {
        errorMessage =
          'Error al crear el cliente. Por favor, verifica los datos personales.';
      } else if (error.message?.includes('lead')) {
        errorMessage =
          'Error al crear la solicitud. Por favor, verifica los datos del vehículo.';
      }

      alert(`❌ ${errorMessage}\n\nDetalles técnicos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (value: string, id: string) => {
    if (id === 'budget') {
      // Remove non-numeric characters
      const numericValue = value.replace(/\D/g, '');

      // Format with thousand separators
      const formattedValue =
        numericValue === '' ? '' : Number(numericValue).toLocaleString('es-CL');

      setFormData((prev) => ({
        ...prev,
        [id]: formattedValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }

    // Update selected brand when brand changes
    if (id === 'brand_id') {
      setSelectedBrandId(value);
      // Reset model when brand changes
      setFormData((prev) => ({ ...prev, model_id: '' }));
    }
  };

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-white dark:bg-dark-bg transition-colors duration-300'>
      {/* Hero Section */}
      <div className='text-center mb-16'>
        <h1 className='text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl'>
          Buscamos Tu Auto
        </h1>
        <p className='mt-4 text-xl text-gray-500 dark:text-gray-400'>
          ¿No encuentras el auto que buscas? Nosotros lo buscamos por ti. Te
          contactamos cuando encontremos opciones que se ajusten a tus
          necesidades.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-16'>
        {/* Search Request Form */}
        <div className='bg-white dark:bg-dark-card rounded-xl shadow-lg p-8 border border-gray-200 dark:border-dark-border'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <Input
                type='text'
                label='Nombre'
                value={formData.first_name}
                onValueChange={(value) => handleChange(value, 'first_name')}
                isRequired
                variant='bordered'
              />
              <Input
                type='text'
                label='Apellido'
                value={formData.last_name}
                onValueChange={(value) => handleChange(value, 'last_name')}
                isRequired
                variant='bordered'
              />
            </div>

            <Input
              type='email'
              label='Email'
              value={formData.email}
              onValueChange={(value) => handleChange(value, 'email')}
              isRequired
              variant='bordered'
            />

            <Input
              type='tel'
              label='Teléfono'
              value={formData.phone}
              onValueChange={(value) => handleChange(value, 'phone')}
              isRequired
              variant='bordered'
            />

            {/* Vehicle Search Criteria */}
            <div className='border-t pt-6'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
                Criterios de Búsqueda
              </h3>
            </div>

            <Autocomplete
              label='Marca'
              placeholder='Selecciona una marca'
              selectedKey={formData.brand_id}
              onSelectionChange={(key) =>
                handleChange(key as string, 'brand_id')
              }
              isRequired
              variant='bordered'
            >
              {brands.map((brand) => (
                <AutocompleteItem key={brand.id} value={brand.id}>
                  {brand.name}
                </AutocompleteItem>
              ))}
            </Autocomplete>

            <Autocomplete
              label='Modelo'
              placeholder='Selecciona un modelo'
              selectedKey={formData.model_id}
              onSelectionChange={(key) =>
                handleChange(key as string, 'model_id')
              }
              isRequired
              isDisabled={!selectedBrandId}
              variant='bordered'
            >
              {models.map((model) => (
                <AutocompleteItem
                  key={model.id.toString()}
                  value={model.id.toString()}
                >
                  {model.name}
                </AutocompleteItem>
              ))}
            </Autocomplete>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <Input
                type='number'
                label='Año desde'
                value={formData.year_from}
                onValueChange={(value) => handleChange(value, 'year_from')}
                placeholder='Ej: 2018'
                variant='bordered'
              />
              <Input
                type='number'
                label='Año hasta'
                value={formData.year_to}
                onValueChange={(value) => handleChange(value, 'year_to')}
                placeholder='Ej: 2023'
                variant='bordered'
              />
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <Input
                type='number'
                label='Kilometraje máximo'
                value={formData.max_mileage}
                onValueChange={(value) => handleChange(value, 'max_mileage')}
                placeholder='Ej: 50000'
                variant='bordered'
              />
              <Input
                type='number'
                label='Máximo de dueños'
                value={formData.max_owners}
                onValueChange={(value) => handleChange(value, 'max_owners')}
                placeholder='Ej: 2'
                variant='bordered'
              />
            </div>

            <Input
              type='text'
              label='Presupuesto'
              value={formData.budget}
              onValueChange={(value) => handleChange(value, 'budget')}
              startContent='$'
              placeholder='Ej: 15.000.000'
              variant='bordered'
            />

            <Textarea
              label='Detalles adicionales'
              value={formData.message}
              onValueChange={(value) => handleChange(value, 'message')}
              minRows={4}
              placeholder='Cuéntanos más detalles sobre lo que buscas...'
              variant='bordered'
            />

            <Button
              type='submit'
              color='primary'
              fullWidth
              className='font-semibold bg-primary text-secondary hover:bg-primary/90 dark:bg-primary dark:text-secondary dark:hover:bg-primary/90'
              isLoading={loading}
            >
              Solicitar Búsqueda
            </Button>
          </form>
        </div>

        {/* Information Section */}
        <div className='bg-gray-50 dark:bg-dark-card rounded-xl p-8 border border-gray-200 dark:border-dark-border'>
          <div className='space-y-8'>
            <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
              ¿Cómo Funciona Nuestro Servicio?
            </h2>

            <div>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                Nuestro proceso
              </h3>
              <ol className='mt-2 text-gray-600 dark:text-gray-400 space-y-2 list-decimal pl-5'>
                <li>Envías tu solicitud con los criterios específicos</li>
                <li>Recibimos tu requerimiento y lo registramos</li>
                <li>Iniciamos la búsqueda activa en nuestro mercado</li>
                <li>Te contactamos cuando encontremos opciones</li>
                <li>Coordinas la visita y evaluación del vehículo</li>
                <li>Realizas la compra si te convence</li>
              </ol>
            </div>

            <div>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                Ventajas del servicio
              </h3>
              <ul className='mt-2 text-gray-600 dark:text-gray-400 space-y-2 list-disc pl-5'>
                <li>Búsqueda personalizada según tus criterios</li>
                <li>Acceso a vehículos no publicados</li>
                <li>Evaluación previa de calidad</li>
                <li>Negociación profesional</li>
                <li>Sin costo adicional por el servicio</li>
                <li>Asesoría especializada</li>
              </ul>
            </div>

            <div>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                Contacto Directo
              </h3>
              <p className='mt-2 text-gray-600 dark:text-gray-400'>
                Email: {client?.contact?.email}
                <br />
                Teléfono: {client?.contact?.phone}
              </p>
            </div>

            <div className='bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg'>
              <h4 className='font-medium text-blue-900 dark:text-blue-100'>
                💡 Tip importante
              </h4>
              <p className='text-sm text-blue-800 dark:text-blue-200 mt-1'>
                Mientras más específicos sean tus criterios, mejor podremos
                encontrar el vehículo ideal para ti. No dudes en agregar
                detalles adicionales en el mensaje.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        leadType={LeadTypes.SEARCH_REQUEST}
        customMessage='¡Solicitud de búsqueda enviada exitosamente! Te contactaremos pronto cuando tengamos opciones que se ajusten a tus criterios.'
      />
    </div>
  );
};

export default WeSearchForYouPage;
