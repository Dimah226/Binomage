import { auth } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import '../style/Auth.css';

function Auth({ handleConnect }) {
    const navigate = useNavigate();
    const [param, setParam] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);

    const handleChange = (e) => {
        setParam({ ...param, [e.target.id]: e.target.value });
    };

    const signIn = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signInWithEmailAndPassword(auth, param.email, param.password);
            handleConnect();
            navigate('/admin');
        } catch (error) {
            console.error("Erreur lors de la connexion:", error.message);
            setError("Email ou mot de passe incorrect");
        } finally {
            setLoading(false);
        }
    };

    const passwordIsVisible = () => {
        setVisible((prevVisible) => !prevVisible);
    };

    return (
        <div className="auth-container-princ">
            <div className="auth-container">
                <form className="form-container" onSubmit={signIn}>
                    <h1>Veuillez vous connecter</h1>
                    {error && <p className="error-message">{error}</p>}

                    <div className="field email">
                        <input
                            type="email"
                            id="email"
                            value={param.email}
                            onChange={handleChange}
                            required
                        />
                        <label htmlFor="email">Email</label>
                        <i className='bx bxl-gmail icon'></i>
                        <i className="separate"></i>
                    </div>

                    <div className="field password">
                        <input
                            type={visible ? "text" : "password"}
                            id="password"
                            value={param.password}
                            onChange={handleChange}
                            required
                        />
                        <label htmlFor="password">Password</label>
                        <i
                            className={`bx icon ${visible ? 'bxs-lock-open-alt' : 'bxs-lock-alt'}`}
                            onClick={passwordIsVisible}
                        ></i>
                        <i className="separate"></i>
                    </div>

                    <div className="btn-div">
                        <button className="btn-auth" type="submit" disabled={loading}>
                            {loading ? 'Chargement...' : 'Connecter'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Auth;
