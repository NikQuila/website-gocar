'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
} from '@heroui/react';
import useClientStore from '@/store/useClientStore';
import useThemeStore from '@/store/useThemeStore';
import useCustomerStore from '@/store/useCustomerStore';
import { supabase } from '@/lib/supabase';
import { Icon } from '@iconify/react';
import { updateLeadById } from '@/lib/leads';

// Estilos uniformes para todos los inputs
const inputStyles = {
  input: 'py-3',
  inputWrapper:
    'border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors py-0 bg-transparent dark:bg-dark-input',
};

// Interfaces
interface Brand {
  id: string | number;
  name: string;
  [key: string]: any;
}

interface Model {
  id: string | number;
  name: string;
  brand_id?: string | number | null;
  [key: string]: any;
}

const PurchaseConsignmentPage = () => {
  const { client } = useClientStore();
  const { theme } = useThemeStore();
  const { initializeCustomer } = useCustomerStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    brand: '',
    model: '',
    year: '',
    message: '',
  });

  const [phoneIsValid, setPhoneIsValid] = useState(true);
  const [phoneError, setPhoneError] = useState(false);

  // Estados para el autocompletado
  const [brandInput, setBrandInput] = useState('');
  const [modelInput, setModelInput] = useState('');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]); // Modelos filtrados por marca
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs para controlar los componentes Autocomplete
  const brandAutocompleteRef = useRef(null);
  const modelAutocompleteRef = useRef(null);
  const [yearInput, setYearInput] = useState('');

  const currentYear = new Date().getFullYear();
  const years = useMemo(() => {
    return Array.from({ length: currentYear - 1989 }, (_, i) => {
      const year = (currentYear - i).toString();
      return { id: year, name: year };
    });
  }, [currentYear]);

  useEffect(() => {
    const fetchBrands = async () => {
      setIsLoadingData(true);
      try {
        const { data: brandsData, error: brandsError } = await supabase
          .from('brands')
          .select('*')
          .order('name');

        if (brandsError) throw brandsError;

        // Guardar las marcas
        if (brandsData) {
          setBrands(brandsData);
        }
      } catch (error: any) {
        console.error('Error al cargar marcas:', error);
        setError(error?.message || 'Error desconocido al cargar marcas');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchBrands();
  }, []);

  // Obtener modelos cuando cambia la marca seleccionada
  useEffect(() => {
    const fetchModels = async () => {
      if (!formData.brand) {
        setModels([]);
        return;
      }

      setIsLoadingModels(true);
      try {
        const { data: modelsData, error: modelsError } = await supabase
          .from('models')
          .select('*')
          .eq('brand_id', formData.brand)
          .order('name');

        if (modelsError) throw modelsError;

        if (modelsData) {
          setModels(modelsData);
        }
      } catch (error: any) {
        console.error('Error al cargar modelos:', error);
        setError(error?.message || 'Error desconocido al cargar modelos');
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchModels();
  }, [formData.brand]);

  // Actualizar los valores de input cuando cambia la selección
  useEffect(() => {
    if (formData.brand) {
      const selectedBrand = brands.find(
        (b) => String(b.id) === String(formData.brand)
      );
      if (selectedBrand) {
        setBrandInput(selectedBrand.name);
      }
    }

    if (formData.model) {
      const selectedModel = models.find(
        (m) => String(m.id) === String(formData.model)
      );
      if (selectedModel) {
        setModelInput(selectedModel.name);
      }
    }

    if (formData.year) {
      setYearInput(formData.year);
    }
  }, [formData.brand, formData.model, formData.year, brands, models]);

  // Filtrar según texto ingresado
  const filteredBrandsByText = useMemo(() => {
    if (!brandInput) return brands;

    return brands.filter((brand) =>
      brand.name.toLowerCase().includes(brandInput.toLowerCase())
    );
  }, [brands, brandInput]);

  const filteredModelsByText = useMemo(() => {
    if (!modelInput) return models;

    return models.filter((model) =>
      model.name.toLowerCase().includes(modelInput.toLowerCase())
    );
  }, [models, modelInput]);

  // Filtrar según texto ingresado para el año
  const filteredYearsByText = useMemo(() => {
    if (!yearInput) return years;

    return years.filter((year) => year.name.includes(yearInput));
  }, [years, yearInput]);

  // Obtenemos los colores corporativos del cliente según el tema actual
  const isDarkMode = theme === 'dark';
  const primaryColor = isDarkMode
    ? client?.theme?.dark?.primary || '#4d9fff'
    : client?.theme?.light?.primary || '#333333';
  const secondaryColor = isDarkMode
    ? client?.theme?.dark?.secondary || '#ffffff'
    : client?.theme?.light?.secondary || '#ffffff';

  const handleChange = (value: string, id: string) => {
    // Para el teléfono, solo permitir dígitos y limitar a 8
    if (id === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 8);
      setFormData((prev) => ({
        ...prev,
        [id]: digitsOnly,
      }));

      // Si el usuario está corrigiendo un error previo, quitar el estado de error
      if (phoneError && digitsOnly.length === 8) {
        setPhoneError(false);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  const handleBrandChange = (value: string) => {
    handleChange(value, 'brand');
    handleChange('', 'model');
    setModelInput('');
  };

  const handleBrandInputChange = (value: string) => {
    setBrandInput(value);

    if (!value) {
      handleChange('', 'brand');
      handleChange('', 'model');
      setModelInput('');
    }
  };

  const handleModelInputChange = (value: string) => {
    setModelInput(value);

    if (!value) {
      handleChange('', 'model');
    }
  };

  const handleYearInputChange = (value: string) => {
    setYearInput(value);

    if (!value) {
      handleChange('', 'year');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación simple: verificar que el teléfono tenga 8 dígitos
    if (formData.phone.length !== 8) {
      setPhoneError(true);
      // Hacer scroll al campo de teléfono
      document
        .querySelector('input[name="phone"]')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);

    try {
      // Dividir el nombre completo en nombre y apellido
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Agregar el prefijo de Chile al teléfono
      const formattedPhone = `+569${formData.phone}`;

      const customer = await initializeCustomer({
        first_name: firstName,
        last_name: lastName,
        email: formData.email,
        phone: formattedPhone,
        client_id: client?.id || '',
        updated_at: new Date().toISOString(),
      });

      // Obtener nombres de marca y modelo para el correo
      const brandName =
        brands.find((b) => String(b.id) === String(formData.brand))?.name ||
        brandInput;
      const modelName =
        models.find((m) => String(m.id) === String(formData.model))?.name ||
        modelInput;

      const leadData = {
        client_id: client?.id || '',
        customer_id: customer.id,
        search_params: null,
        status: 'pending',
        notes: formData.message,
        created_at: new Date().toISOString(),
        type: 'consignment',
      };

      const { data: createdLead, error: leadError } = await supabase
        .from('leads')
        .insert([leadData])
        .select()
        .single();

      if (leadError) {
        console.error('Error al crear lead:', leadError);
        // Continuar con el flujo normal aunque haya error en el lead
      } else {
      }

      // Email directo
      const emailBody = `
Nuevo formulario de Compra/Consignación:

Nombre: ${formData.name}
Email: ${formData.email}
Teléfono: +569${formData.phone}
Marca: ${brandName}
Modelo: ${modelName}
Año: ${formData.year}

Mensaje:
${formData.message}
      `;

      const mailtoUrl = `mailto:${
        client?.contact?.email || 'contacto@empresa.com'
      }?subject=Formulario Compra/Consignación desde ${
        client?.name || 'Website'
      }&body=${encodeURIComponent(emailBody)}`;

      // Abrir el cliente de correo predeterminado
      window.location.href = mailtoUrl;

      // Indicar éxito y resetear el formulario
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        brand: '',
        model: '',
        year: '',
        message: '',
      });
      setBrandInput('');
      setModelInput('');
      setYearInput('');
    } catch (error: any) {
      console.error('Error al procesar el formulario:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 dark:bg-dark-bg transition-colors duration-300 mt-10 text-center mb-8'>
      <h1 className='text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl uppercase tracking-wide mb-2'>
        FORMULARIO
        <br />
        COMPRA / CONSIGNACIÓN
      </h1>

      <p className='max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400 mb-8'>
        Completa los datos para vender o consignar tu vehículo con nosotros
      </p>

      <div className='max-w-5xl mx-auto bg-white dark:bg-dark-card rounded-xl shadow-sm p-6 sm:p-8 border border-gray-100 dark:border-dark-border'>
        {success ? (
          <div className='text-center py-12'>
            <div
              className='rounded-full mx-auto w-20 h-20 flex items-center justify-center mb-6'
              style={{ backgroundColor: primaryColor, color: secondaryColor }}
            >
              <Icon icon='mdi:check' className='text-4xl' />
            </div>
            <h2 className='text-2xl font-semibold text-gray-900 dark:text-white mb-4'>
              ¡Formulario enviado con éxito!
            </h2>
            <p className='text-gray-600 dark:text-gray-400 mb-6'>
              Nos pondremos en contacto contigo a la brevedad.
            </p>
            <Button
              onClick={() => setSuccess(false)}
              className='font-semibold'
              style={{
                backgroundColor: primaryColor,
                color: secondaryColor,
              }}
            >
              Enviar otro formulario
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-5'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <div>
                <label className='block text-gray-700 dark:text-gray-300 mb-2 font-medium text-left'>
                  Nombre Completo
                </label>
                <Input
                  value={formData.name}
                  onValueChange={(value) => handleChange(value, 'name')}
                  placeholder='Nombre y apellido'
                  isRequired
                  classNames={inputStyles}
                  variant='flat'
                />
              </div>
              <div>
                <label className='block text-gray-700 dark:text-gray-300 mb-2 font-medium text-left'>
                  Email
                </label>
                <Input
                  type='email'
                  value={formData.email}
                  onValueChange={(value) => handleChange(value, 'email')}
                  placeholder='tu@email.com'
                  isRequired
                  classNames={inputStyles}
                  variant='flat'
                />
              </div>
              <div>
                <label className='block text-gray-700 dark:text-gray-300 mb-2 font-medium text-left'>
                  Teléfono
                </label>
                <Input
                  name='phone'
                  value={formData.phone}
                  onValueChange={(value) => handleChange(value, 'phone')}
                  placeholder='Tu número de teléfono (8 dígitos)'
                  isRequired
                  classNames={{
                    ...inputStyles,
                    inputWrapper: `${inputStyles.inputWrapper} ${
                      phoneError
                        ? 'border-danger dark:border-danger bg-danger-50 dark:bg-danger-900/20'
                        : ''
                    }`,
                    description: phoneError ? 'text-danger font-medium' : '',
                  }}
                  variant='flat'
                  maxLength={8}
                  startContent={
                    <div className='pointer-events-none flex items-center'>
                      <span className='text-gray-500 dark:text-gray-400 text-sm'>
                        +569
                      </span>
                    </div>
                  }
                  description={
                    phoneError ? 'Debes ingresar exactamente 8 dígitos' : ''
                  }
                  color={phoneError ? 'danger' : 'default'}
                />
              </div>

              <div>
                <label className='block text-gray-700 dark:text-gray-300 mb-2 font-medium text-left'>
                  Marca
                </label>
                <Autocomplete
                  ref={brandAutocompleteRef}
                  defaultItems={brands}
                  items={filteredBrandsByText}
                  inputValue={brandInput}
                  onInputChange={handleBrandInputChange}
                  isLoading={isLoadingData}
                  placeholder='Busca o selecciona una marca'
                  selectedKey={formData.brand}
                  onSelectionChange={(key) => handleBrandChange(key as string)}
                  isRequired
                  allowsCustomValue={false}
                  className='max-w-full bg-white dark:bg-gray-900'
                  classNames={{
                    base: 'w-full',
                    listboxWrapper: 'max-h-[320px]',
                    listbox:
                      'bg-white dark:bg-gray-900 text-gray-800 dark:text-white',
                    popoverContent:
                      'bg-white dark:bg-gray-900 dark:border-gray-700',
                    clearButton: 'text-gray-500 dark:text-gray-400',
                    endContentWrapper: 'text-gray-500 dark:text-gray-400',
                  }}
                  variant='bordered'
                  size='md'
                  color='default'
                >
                  {(item) => (
                    <AutocompleteItem
                      key={item.id}
                      textValue={item.name}
                      className='text-gray-800 dark:text-white data-[hover=true]:bg-gray-100 dark:data-[hover=true]:bg-gray-800'
                    >
                      {item.name}
                    </AutocompleteItem>
                  )}
                </Autocomplete>
              </div>

              <div>
                <label className='block text-gray-700 dark:text-gray-300 mb-2 font-medium text-left'>
                  Modelo
                </label>
                <Autocomplete
                  ref={modelAutocompleteRef}
                  defaultItems={models}
                  items={filteredModelsByText}
                  inputValue={modelInput}
                  onInputChange={handleModelInputChange}
                  isLoading={isLoadingModels}
                  placeholder={
                    formData.brand
                      ? models.length > 0
                        ? 'Busca o selecciona un modelo'
                        : 'No hay modelos para esta marca'
                      : 'Primero selecciona una marca'
                  }
                  selectedKey={formData.model}
                  onSelectionChange={(key) =>
                    handleChange(key as string, 'model')
                  }
                  isDisabled={!formData.brand}
                  isRequired
                  allowsCustomValue={false}
                  className='max-w-full bg-white dark:bg-gray-900'
                  classNames={{
                    base: 'w-full',
                    listboxWrapper: 'max-h-[320px]',
                    listbox:
                      'bg-white dark:bg-gray-900 text-gray-800 dark:text-white',
                    popoverContent:
                      'bg-white dark:bg-gray-900 dark:border-gray-700',
                    clearButton: 'text-gray-500 dark:text-gray-400',
                    endContentWrapper: 'text-gray-500 dark:text-gray-400',
                  }}
                  variant='bordered'
                  size='md'
                  color='default'
                >
                  {(item) => (
                    <AutocompleteItem
                      key={item.id}
                      textValue={item.name}
                      className='text-gray-800 dark:text-white data-[hover=true]:bg-gray-100 dark:data-[hover=true]:bg-gray-800'
                    >
                      {item.name}
                    </AutocompleteItem>
                  )}
                </Autocomplete>
              </div>

              <div>
                <label className='block text-gray-700 dark:text-gray-300 mb-2 font-medium text-left'>
                  Año
                </label>
                <Autocomplete
                  defaultItems={years}
                  items={filteredYearsByText}
                  inputValue={yearInput}
                  onInputChange={handleYearInputChange}
                  placeholder='Selecciona el año del vehículo'
                  selectedKey={formData.year}
                  onSelectionChange={(key) =>
                    handleChange(key as string, 'year')
                  }
                  isRequired
                  allowsCustomValue={false}
                  className='max-w-full bg-white dark:bg-gray-900'
                  classNames={{
                    base: 'w-full',
                    listboxWrapper: 'max-h-[320px]',
                    listbox:
                      'bg-white dark:bg-gray-900 text-gray-800 dark:text-white',
                    popoverContent:
                      'bg-white dark:bg-gray-900 dark:border-gray-700',
                    clearButton: 'text-gray-500 dark:text-gray-400',
                    endContentWrapper:
                      'text-gray-500 dark:text-gray-400 h-[49px]',
                  }}
                  variant='bordered'
                  size='md'
                  color='default'
                >
                  {(item) => (
                    <AutocompleteItem
                      key={item.id}
                      textValue={item.name}
                      className='text-gray-800 dark:text-white data-[hover=true]:bg-gray-100 dark:data-[hover=true]:bg-gray-800'
                    >
                      {item.name}
                    </AutocompleteItem>
                  )}
                </Autocomplete>
              </div>
            </div>

            <div>
              <label className='block text-gray-700 dark:text-gray-300 mb-2 font-medium text-left'>
                Mensaje
              </label>
              <Textarea
                value={formData.message}
                onValueChange={(value) => handleChange(value, 'message')}
                placeholder='Detalles adicionales sobre tu vehículo (kilometraje, estado, etc.)'
                minRows={5}
                isRequired
                classNames={{
                  inputWrapper:
                    'border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors bg-transparent dark:bg-dark-input',
                  input: 'resize-none',
                }}
                variant='flat'
              />
            </div>

            <div className='pt-4'>
              <Button
                type='submit'
                color='primary'
                className='py-6 font-semibold text-lg uppercase bg-zinc-800 hover:bg-zinc-700 text-white'
                style={{
                  backgroundColor: primaryColor,
                  color: secondaryColor,
                }}
                isLoading={loading}
                fullWidth
              >
                Enviar formulario
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PurchaseConsignmentPage;
