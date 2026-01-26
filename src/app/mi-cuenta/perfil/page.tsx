"use client";

import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface ProfileFormData {
  nombre: string;
  apellido: string;
  telefono: string;
  cedula: string;
  fecha_nacimiento: string;
  direccion: string;
  ciudad: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function PerfilPage() {
  const { user, profile, refreshProfile } = useAuth();
  const { addToast } = useToast();
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [profileData, setProfileData] = useState<ProfileFormData>({
    nombre: "",
    apellido: "",
    telefono: "",
    cedula: "",
    fecha_nacimiento: "",
    direccion: "",
    ciudad: "",
  });
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<ProfileFormData & PasswordFormData>>({});

  // Load profile data
  useEffect(() => {
    const loadFullProfile = async () => {
      if (!user) return;

      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfileData({
          nombre: data.nombre || "",
          apellido: data.apellido || "",
          telefono: data.telefono || "",
          cedula: data.cedula || "",
          fecha_nacimiento: data.fecha_nacimiento || "",
          direccion: data.direccion || "",
          ciudad: data.ciudad || "",
        });
      }
    };

    loadFullProfile();
  }, [user]);

  const validateProfileForm = (): boolean => {
    const newErrors: Partial<ProfileFormData> = {};

    if (!profileData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }
    if (!profileData.apellido.trim()) {
      newErrors.apellido = "El apellido es requerido";
    }
    if (!profileData.cedula.trim()) {
      newErrors.cedula = "La cédula es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: Partial<PasswordFormData> = {};

    if (!passwordData.newPassword) {
      newErrors.newPassword = "La nueva contraseña es requerida";
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "La contraseña debe tener al menos 8 caracteres";
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfileForm() || !user) return;

    setIsLoadingProfile(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          nombre: profileData.nombre,
          apellido: profileData.apellido,
          telefono: profileData.telefono || null,
          cedula: profileData.cedula,
          fecha_nacimiento: profileData.fecha_nacimiento || null,
          direccion: profileData.direccion || null,
          ciudad: profileData.ciudad || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      await refreshProfile();
      addToast({
        type: "success",
        title: "Perfil actualizado",
        description: "Tus datos han sido guardados correctamente.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      addToast({
        type: "error",
        title: "Error",
        description: "No se pudo actualizar el perfil. Intentá de nuevo.",
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    setIsLoadingPassword(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      addToast({
        type: "success",
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido cambiada correctamente.",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      addToast({
        type: "error",
        title: "Error",
        description: "No se pudo actualizar la contraseña. Intentá de nuevo.",
      });
    } finally {
      setIsLoadingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card variant="default">
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
          <CardDescription>
            Actualizá tus datos personales. La cédula se usa para identificarte como socio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nombre"
                value={profileData.nombre}
                onChange={(e) => setProfileData({ ...profileData, nombre: e.target.value })}
                error={errors.nombre}
                autoComplete="given-name"
                required
              />
              <Input
                label="Apellido"
                value={profileData.apellido}
                onChange={(e) => setProfileData({ ...profileData, apellido: e.target.value })}
                error={errors.apellido}
                autoComplete="family-name"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Cédula de Identidad"
                value={profileData.cedula}
                onChange={(e) => setProfileData({ ...profileData, cedula: e.target.value })}
                error={errors.cedula}
                placeholder="1.234.567-8"
                autoComplete="off"
                required
              />
              <Input
                label="Teléfono"
                type="tel"
                value={profileData.telefono}
                onChange={(e) => setProfileData({ ...profileData, telefono: e.target.value })}
                placeholder="099 123 456"
                autoComplete="tel"
              />
            </div>

            <Input
              label="Fecha de Nacimiento"
              type="date"
              value={profileData.fecha_nacimiento}
              onChange={(e) => setProfileData({ ...profileData, fecha_nacimiento: e.target.value })}
              autoComplete="bday"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Dirección"
                value={profileData.direccion}
                onChange={(e) => setProfileData({ ...profileData, direccion: e.target.value })}
                placeholder="Av. 18 de Julio 1234"
                autoComplete="street-address"
              />
              <Input
                label="Ciudad"
                value={profileData.ciudad}
                onChange={(e) => setProfileData({ ...profileData, ciudad: e.target.value })}
                placeholder="Montevideo"
                autoComplete="address-level2"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" isLoading={isLoadingProfile}>
                Guardar Cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Email (read-only) */}
      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Email</CardTitle>
          <CardDescription>
            Tu dirección de email no puede ser modificada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                value={user?.email || ""}
                disabled
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              />
            </div>
            <span className="text-sm text-green-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Verificado
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Membership Status */}
      {profile && (
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Estado de Membresía</CardTitle>
            <CardDescription>
              Tu rol actual en Club Seminario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className={`
                w-16 h-16 rounded-2xl flex items-center justify-center
                ${profile.rol === "socio" ? "bg-gradient-to-br from-amarillo to-amarillo-dark" : ""}
                ${profile.rol === "admin" ? "bg-gradient-to-br from-green-500 to-green-600" : ""}
                ${profile.rol === "directivo" ? "bg-gradient-to-br from-blue-500 to-blue-600" : ""}
                ${profile.rol === "funcionario" ? "bg-gradient-to-br from-purple-500 to-purple-600" : ""}
                ${profile.rol === "usuario" ? "bg-gradient-to-br from-gray-400 to-gray-500" : ""}
              `}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {profile.rol === "socio" && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  )}
                  {profile.rol === "admin" && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  )}
                  {(profile.rol === "directivo" || profile.rol === "funcionario" || profile.rol === "usuario") && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  )}
                </svg>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900 capitalize">{profile.rol}</p>
                <p className="text-sm text-gray-500">
                  {profile.rol === "socio" && "Acceso completo a beneficios y precios especiales"}
                  {profile.rol === "admin" && "Acceso total al sistema de administración"}
                  {profile.rol === "directivo" && "Acceso a reportes y gestión de eventos"}
                  {profile.rol === "funcionario" && "Acceso según permisos asignados"}
                  {profile.rol === "usuario" && "Podés comprar en la tienda y adquirir entradas"}
                </p>
              </div>
            </div>
            {profile.rol === "usuario" && (
              <div className="mt-4 p-4 bg-amarillo/10 rounded-xl border border-amarillo/20">
                <p className="text-sm text-gray-700">
                  <strong>¿Querés ser socio?</strong> Contactate con nosotros para conocer los beneficios y cómo asociarte.
                </p>
                <a href="/socios" className="text-sm text-bordo hover:text-bordo-dark font-medium mt-2 inline-block">
                  Más información sobre membresías →
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Change Password */}
      <Card variant="default">
        <CardHeader>
          <CardTitle>Cambiar Contraseña</CardTitle>
          <CardDescription>
            Actualizá tu contraseña para mantener tu cuenta segura.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <Input
              label="Nueva Contraseña"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              error={errors.newPassword}
              hint="Mínimo 8 caracteres"
              autoComplete="new-password"
            />

            <Input
              label="Confirmar Nueva Contraseña"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />

            <div className="flex justify-end">
              <Button type="submit" variant="outline" isLoading={isLoadingPassword}>
                Cambiar Contraseña
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card variant="outlined" className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Zona de Peligro</CardTitle>
          <CardDescription>
            Acciones irreversibles relacionadas con tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Eliminar cuenta</p>
              <p className="text-sm text-gray-500">
                Esta acción eliminará permanentemente tu cuenta y todos tus datos.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                addToast({
                  type: "info",
                  title: "Contactanos",
                  description: "Para eliminar tu cuenta, escribinos a secretaria@clubseminario.com.uy",
                });
              }}
            >
              Solicitar Eliminación
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
