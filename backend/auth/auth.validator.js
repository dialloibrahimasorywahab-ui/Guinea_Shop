import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  login: yup.string().trim(),
  email: yup.string().trim().email("Format d'email invalide"),
  password: yup.string().required("Le mot de passe est obligatoire"),
}).test(
  'login-or-email',
  "Le champ login ou email est obligatoire",
  (val) => !!(val && (val.login || val.email))
);

export const refreshTokenSchema = yup.object().shape({
  refreshToken: yup.string().trim().required("Le refresh token est obligatoire"),
});

