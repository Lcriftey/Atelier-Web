import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import styles from './AdminAuthGate.module.css';

function AdminAuthGate({ children }) {
  const [authState, setAuthState] = useState({
    status: isSupabaseConfigured ? 'loading' : 'configuration-error',
    session: null,
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [logoutError, setLogoutError] = useState('');

  useEffect(() => {
    const existingRobotsMeta = document.querySelector('meta[name="robots"]');
    const originalRobotsContent = existingRobotsMeta?.content;
    const robotsMeta = existingRobotsMeta || document.createElement('meta');
    robotsMeta.name = 'robots';
    robotsMeta.content = 'noindex, nofollow';
    if (!existingRobotsMeta) document.head.appendChild(robotsMeta);

    return () => {
      if (existingRobotsMeta) {
        robotsMeta.content = originalRobotsContent;
      } else {
        robotsMeta.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!supabase) return undefined;

    let active = true;
    let sessionCheckComplete = false;
    let receivedAuthEvent = false;
    let eventSession = null;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (sessionCheckComplete) {
        setAuthState({ status: 'ready', session });
      } else {
        receivedAuthEvent = true;
        eventSession = session;
      }
    });

    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (error) throw error;
        if (!active) return;
        sessionCheckComplete = true;
        setAuthState({
          status: 'ready',
          session: receivedAuthEvent ? eventSession : data.session,
        });
      })
      .catch(() => {
        if (!active) return;
        sessionCheckComplete = true;
        setAuthState({ status: 'session-error', session: null });
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogin(event) {
    event.preventDefault();
    if (!supabase) return;

    setIsSubmitting(true);
    setLoginError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      setAuthState({ status: 'ready', session: data.session });
      setPassword('');
    } catch {
      setLoginError('Correo o contraseña incorrectos');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    if (!supabase) return;
    setLogoutError('');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setAuthState({ status: 'ready', session: null });
    } catch {
      setLogoutError('No se pudo cerrar la sesión. Inténtalo de nuevo.');
    }
  }

  if (authState.status === 'loading') {
    return <main className={styles.statePage} aria-live="polite">Comprobando sesión...</main>;
  }

  if (authState.status === 'configuration-error') {
    return (
      <main className={styles.statePage}>
        <section className={styles.messagePanel}>
          <p className={styles.eyebrow}>Administración</p>
          <h1>Configuración pendiente</h1>
          <p>Configura la URL y la clave pública de Supabase en las variables de entorno del frontend.</p>
        </section>
      </main>
    );
  }

  if (authState.status === 'session-error') {
    return (
      <main className={styles.statePage}>
        <section className={styles.messagePanel}>
          <p className={styles.eyebrow}>Administración</p>
          <h1>No se pudo comprobar la sesión</h1>
          <p>Revisa tu conexión e inténtalo de nuevo.</p>
          <button className={styles.submitButton} type="button" onClick={() => window.location.reload()}>Reintentar</button>
        </section>
      </main>
    );
  }

  if (authState.session) {
    return (
      <>
        <div className={styles.sessionBar}>
          <span className={styles.sessionBrand}>
            <span aria-hidden="true" className={styles.sessionIcon}>▦</span>
            <span>Registro de galería</span>
            <small>Administración</small>
          </span>
          <button type="button" onClick={handleLogout}>Cerrar sesión</button>
        </div>
        {logoutError && <p className={styles.logoutError} role="alert">{logoutError}</p>}
        {children}
      </>
    );
  }

  return (
    <main className={styles.loginPage}>
      <section className={styles.loginPanel}>
        <p className={styles.eyebrow}>11-10 Atelier · Administración</p>
        <h1>Iniciar sesión</h1>
        <form className={styles.loginForm} onSubmit={handleLogin}>
          <label>
            Correo electrónico
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label>
            Contraseña
            <span className={styles.passwordControl}>
              <input
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
              />
              <button
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onClick={() => setShowPassword((visible) => !visible)}
                type="button"
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </span>
          </label>
          {loginError && <p className={styles.error} role="alert">{loginError}</p>}
          <button className={styles.submitButton} disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default AdminAuthGate;
