// TODO(v3): eliminar este archivo — los usuarios viven en la base de datos del servidor
// Contraseñas: admin → Admin1234!  |  usuario → User1234!
export interface UserConfig {
  username: string
  passwordHash: string  // SHA-256 del password en claro
}

export const USERS: UserConfig[] = [
  {
    username: 'admin',
    passwordHash: '5ce41ada64f1e8ffb0acfaafa622b141438f3a5777785e7f0b830fb73e40d3d6',
  },
  {
    username: 'usuario',
    passwordHash: '0ac8adfad468b363de01d0556d4239831b654eab5d732cf7564b8e975853c22c',
  },
]
