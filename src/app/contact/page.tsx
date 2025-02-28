"use client";

import { useState } from "react";
import { Button, Input, Select, SelectItem, Textarea } from "@heroui/react";
import useClientStore from "@/store/useClientStore";
import useCustomerStore from "@/store/useCustomerStore";
import { supabase } from "@/lib/supabase";
import { Mail } from "@/utils/types";

const ContactPage = () => {
  const { client } = useClientStore();
  const { initializeCustomer } = useCustomerStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    reason: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      // Primero inicializamos o actualizamos el customer
      const customerResponse = await initializeCustomer({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
      });

      // Guardamos el email en la base de datos
      const { error: mailError } = await supabase.from("mails").insert([
        {
          customer_id: customerResponse.id, // Usamos el ID del customer
          subject: `Nuevo contacto desde ${client?.name}`,
          body: `
Nombre: ${formData.first_name} ${formData.last_name}
Email: ${formData.email}
Teléfono: ${formData.phone}
Motivo: ${formData.reason}

Mensaje:
${formData.message}
        `,
          reason: mapReasonToType(formData.reason),
        },
      ]);

      if (mailError) throw mailError;

      // Crear la URL del mailto con los parámetros codificados
      const emailBody = `
Nuevo mensaje de contacto:

Nombre: ${formData.first_name} ${formData.last_name}
Email: ${formData.email}
Teléfono: ${formData.phone}
Motivo: ${formData.reason}

Mensaje:
${formData.message}
    `;

      const mailtoUrl = `mailto:${
        client?.contact?.email
      }?subject=Nuevo contacto desde ${client?.name}&body=${encodeURIComponent(
        emailBody
      )}`;

      // Abrir el cliente de correo predeterminado
      window.location.href = mailtoUrl;
    } catch (error) {
      console.error("Error al procesar el formulario:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (value: string, id: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Función auxiliar para mapear el motivo a los tipos permitidos
  const mapReasonToType = (reason: string): Mail["reason"] => {
    switch (reason) {
      case "Compra de Vehículo":
        return "buy";
      case "Venta de Vehículo":
        return "sell";
      default:
        return "other";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-white dark:bg-dark-bg transition-colors duration-300">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
          Contáctanos
        </h1>
        <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">
          Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo
          antes posible.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Contact Form */}
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-8 border border-gray-200 dark:border-dark-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="text"
                label="Nombre"
                value={formData.first_name}
                onValueChange={(value) => handleChange(value, "first_name")}
                isRequired
                variant="bordered"
              />
              <Input
                type="text"
                label="Apellido"
                value={formData.last_name}
                onValueChange={(value) => handleChange(value, "last_name")}
                isRequired
                variant="bordered"
              />
            </div>

            <Input
              type="email"
              label="Email"
              value={formData.email}
              onValueChange={(value) => handleChange(value, "email")}
              isRequired
              variant="bordered"
            />

            <Input
              type="tel"
              label="Teléfono"
              value={formData.phone}
              onValueChange={(value) => handleChange(value, "phone")}
              isRequired
              variant="bordered"
            />

            <Select
              label="Motivo de Contacto"
              value={formData.reason}
              onChange={(e) => handleChange(e.target.value, "reason")}
              isRequired
              variant="bordered"
            >
              <SelectItem key="Compra de Vehículo" value="Compra de Vehículo">
                Compra de Vehículo
              </SelectItem>
              <SelectItem key="Venta de Vehículo" value="Venta de Vehículo">
                Venta de Vehículo
              </SelectItem>
              <SelectItem key="Consulta General" value="Consulta General">
                Consulta General
              </SelectItem>
              <SelectItem key="Otro" value="Otro">
                Otro
              </SelectItem>
            </Select>

            <Textarea
              label="Mensaje"
              value={formData.message}
              onValueChange={(value) => handleChange(value, "message")}
              minRows={4}
              isRequired
              variant="bordered"
            />

            <Button
              type="submit"
              color="primary"
              className="w-full py-3 font-medium"
              isLoading={loading}
            >
              Enviar Mensaje
            </Button>
          </form>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 dark:bg-dark-card rounded-xl p-8 border border-gray-200 dark:border-dark-border">
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Información de Contacto
            </h2>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Ubicación
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {client?.contact?.address}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Horario
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Lunes a Viernes: 9:00 AM - 6:00 PM
                <br />
                Sábado: 10:00 AM - 2:00 PM
                <br />
                Domingo: Cerrado
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Contacto Directo
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Email: {client?.contact?.email}
                <br />
                Teléfono: {client?.contact?.phone}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
