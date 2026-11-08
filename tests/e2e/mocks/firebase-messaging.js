// Mock do FCM para testes: devolve um token fixo.
export const getMessaging = () => ({});
export const getToken = async () => 'mock-push-token-123';
export const deleteToken = async () => true;
export const onMessage = () => () => {};
