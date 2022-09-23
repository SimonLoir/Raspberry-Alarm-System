import { useState } from 'react';

export default function LoginPage() {
    const [password, setPassword] = useState('');
    return (
        <>
            <h1>Login</h1>
            <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button
                onClick={async () => {
                    const response = await fetch(
                        '/api/auth/token?password=' + password
                    );
                    const { token } = await response.json();
                    if (token) {
                        localStorage.setItem('token', token);
                        window.location.href = '/';
                    }
                }}
            >
                Se connecter
            </button>
        </>
    );
}
