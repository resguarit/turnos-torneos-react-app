import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function EditProfile() {
  const [formData, setFormData] = useState({
    name: '',
    email: 'kddw@gmail.com',
    currentPassword: '',
    newPassword: '',
    emailNotifications: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleLogout = () => {
    console.log('Logging out...');
  };

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información Personal */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold">Información Personal</h2>
              <p className="text-sm text-muted-foreground">
                Actualiza tu información personal y de contacto.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Cambiar Contraseña */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold">Cambiar Contraseña</h2>
              <p className="text-sm text-muted-foreground">
                Asegúrate de usar una contraseña segura.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña Actual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Preferencias de Notificación */}
{/*           <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold">Preferencias de Notificación</h2>
              <p className="text-sm text-muted-foreground">
                Gestiona cómo y cuándo recibes notificaciones.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <Checkbox
                id="emailNotifications"
                checked={formData.emailNotifications}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, emailNotifications: checked })
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="emailNotifications"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Notificaciones por Email
                </Label>
                <p className="text-sm text-muted-foreground">
                  Recibe actualizaciones sobre tus reservas y torneos por email.
                </p>
              </div>
            </div>
          </div> */}

          {/* Acciones del Formulario */}
          <div className="flex justify-between">
            <Button type="button" variant="destructive" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
            <Button type="submit">Guardar Cambios</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
