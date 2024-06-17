import { useContext, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from 'axios';
import { UserContext } from "../components/UserContext";


export default function LoginPage() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [redirect, setRedirect] = useState(false);
    const {setUser} = useContext(UserContext);


    async function handleLoginSumbit(event) {
        event.preventDefault();

        try {
            const response = await axios.post('/login', {email, password});
            setUser(response.data);
            alert('Login Successful');
            setRedirect(true);
        } catch (err) {
            alert('Login Failed');
        }

    }

    if (redirect) {
        return <Navigate to={'/'} />
    }


    return (
        <div className=" mt-4 grow flex items-center justify-around">
            <div className="-mt-64">
                <h1 className="text-4xl text-center mb-4">
                    Login
                </h1>
                <form className="max-w-md mx-auto " onSubmit={handleLoginSumbit}>
                    <input type="email" 
                    placeholder='your@email.com'
                    value={email}
                    onChange={event => setEmail(event.target.value)}/>

                    <input type="password" 
                    placeholder='password' 
                    value={password}
                    onChange={event => setPassword(event.target.value)}/>
                    <button className="primary">Login</button>

                    <div className="text-center py-2 text-gray-500">
                        Don&#39;t have an account yet? <Link to={'/register'} className="underlined text-black">Register Now</Link>
                    </div>
                </form>
            </div>            
        </div>
    )
}