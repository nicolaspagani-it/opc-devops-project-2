// Fabrique un faux JWT : en-tête.contenu.signature, avec une date d'expiration (champ "exp", en secondes).
// Le front ne lit que cette date pour savoir si l'utilisateur est connecté (AuthService.isLoggedIn).
export function fakeJwt(expiresInSeconds = 3600): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  return 'header.' + btoa(JSON.stringify({ sub: 'jdoe', exp })) + '.signature';
}
