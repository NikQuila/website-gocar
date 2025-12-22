'use client';

import { useState, useEffect, useCallback } from 'react';
import useClientStore from '../../store/useClientStore';
import useVehicleFiltersStore from '@/store/useVehicleFiltersStore';
import useVehiclesStore from '@/store/useVehiclesStore';
import { useTranslation } from '@/i18n/hooks/useTranslation';
import { Input, Spinner } from '@heroui/react';
import { Search, X } from 'lucide-react';
import { FaMicrophone } from 'react-icons/fa';

const searchExamples = [
  'Toyota Corolla blanco',
  'SUV automático bajo 15 millones',
  'Sedán nuevo con garantía',
];

export default function WelcomeSection() {
  const { client } = useClientStore();
  const { t } = useTranslation();
  const { setSearchQuery, clearFilters } = useVehicleFiltersStore();
  const { vehicles } = useVehiclesStore();
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [placeholder, setPlaceholder] = useState('');
  const [exampleIndex, setExampleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Typewriter effect for placeholder
  useEffect(() => {
    const currentExample = searchExamples[exampleIndex];

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (charIndex < currentExample.length) {
          setPlaceholder(currentExample.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          // Finished typing, wait then start deleting
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        // Deleting
        if (charIndex > 0) {
          setPlaceholder(currentExample.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          // Finished deleting, move to next example
          setIsDeleting(false);
          setExampleIndex((exampleIndex + 1) % searchExamples.length);
        }
      }
    }, isDeleting ? 30 : 80);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, exampleIndex]);

  const handleSearch = (value: string) => {
    if (!value.trim()) return;

    setIsLoading(true);

    // Establecer la búsqueda - el filtrado inteligente ocurre en NewVehiclesSection
    setSearchQuery(value);

    // Scroll suave a la sección de vehículos
    setTimeout(() => {
      const vehiclesSection = document.getElementById('vehicles-section');
      if (vehiclesSection) {
        vehiclesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setIsLoading(false);
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(inputValue);
    }
  };

  const handleClear = () => {
    setInputValue('');
    setSearchQuery('');
    const maxPrice = Math.max(...vehicles.map(v => v.price || 0));
    clearFilters(maxPrice);
  };

  const startVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'es-ES';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        handleSearch(transcript);
      };

      recognition.start();
    }
  };

  return (
    <div className='bg-white dark:bg-dark-bg transition-colors'>
      <div className='relative isolate overflow-hidden'>
        <div className='mx-auto max-w-7xl px-6 py-24 sm:pt-32 lg:px-8'>
          {/* Hero content - Centered */}
          <div className='text-center'>
            <h1
              className='text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl max-w-3xl mx-auto'
              style={{ lineHeight: '1.1' }}
            >
              {t('home.welcome.title')}{' '}
              <span className='text-primary'>{client?.name}</span>
            </h1>

            <p className='mt-6 text-xl leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto'>
              {t('home.welcome.description')}
            </p>

            {/* Buscador inteligente */}
            <div className='mt-10 max-w-3xl mx-auto'>
              <div className='relative'>
                <Input
                  type='text'
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={placeholder || searchExamples[0].charAt(0)}
                  size='lg'
                  radius='lg'
                  isDisabled={isLoading}
                  startContent={
                    <Search size={18} className='text-primary ml-1' />
                  }
                  classNames={{
                    base: 'w-full',
                    inputWrapper: 'bg-slate-100 dark:bg-[#0B0B0F] border-none shadow-lg h-14',
                    input: 'text-base',
                  }}
                  endContent={
                    <div className='flex items-center gap-1'>
                      {isLoading ? (
                        <Spinner size='sm' />
                      ) : (
                        <>
                          {inputValue && (
                            <button
                              onClick={handleClear}
                              className='p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
                              aria-label={t('home.welcome.clearSearch')}
                            >
                              <X size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handleSearch(inputValue)}
                            className='p-2 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors'
                            aria-label={t('home.welcome.search')}
                          >
                            <Search size={20} />
                          </button>
                          <button
                            onClick={startVoiceRecognition}
                            className={`p-2 transition-colors ${
                              isListening
                                ? 'text-primary animate-pulse'
                                : 'text-gray-500 dark:text-gray-400 hover:text-primary'
                            }`}
                            aria-label={t('home.welcome.voiceSearch')}
                          >
                            <FaMicrophone size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
