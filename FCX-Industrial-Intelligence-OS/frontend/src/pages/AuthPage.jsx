import { LockKeyhole } from 'lucide-react';
import { useState } from 'react';
import { apiRequest, login } from '../api';

export default function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function submit(event) {
    event.preventDefault();
    setMessage('');
    try {
      if (mode === 'login') {
        await login(email, password);
        onAuthenticated();
      } else {
        await apiRequest('/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
        setMessage('Solicitação recebida. Verifique as instruções de recuperação.');
      }
    } catch {
      setMessage(mode === 'login' ? 'Credenciais inválidas.' : 'Não foi possível processar a solicitação.');
    }
  }

  return <main className="authPage">
    <form className="authPanel" onSubmit={submit}>
      <div className="authMark"><LockKeyhole size={24} /></div>
      <h1>FCX 5.2</h1>
      <p>{mode === 'login' ? 'Acesso corporativo' : 'Recuperação de acesso'}</p>
      <label>E-mail<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      {mode === 'login' ? <label>Senha<input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label> : null}
      {message ? <div className="notice">{message}</div> : null}
      <button className="primaryButton">{mode === 'login' ? 'Entrar' : 'Solicitar recuperação'}</button>
      <button type="button" className="authLink" onClick={() => setMode(mode === 'login' ? 'forgot' : 'login')}>{mode === 'login' ? 'Esqueci minha senha' : 'Voltar ao login'}</button>
    </form>
  </main>;
}
