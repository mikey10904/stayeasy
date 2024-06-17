import { useContext, useState } from "react";
import { UserContext } from "../components/UserContext";
import { Navigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import PlacesPage from "./PlacesPage";
import AccountNav from "./AccountNav";



export default function AccountPage() {

    let {subpage} = useParams();

    const {ready, user, setUser} = useContext(UserContext);
    const [redirect, setRedirect] = useState(null);

    if (!ready) {
        return 'Loading...';
    }

    if (ready && !user && !redirect) {
        return <Navigate to={'/login'}/>
    }


    if (subpage === undefined) {
        subpage = 'profile';
    }

    async function logout() {
        await axios.post('/logout');
        setRedirect('/')
        setUser(null);
    }

    

    

    if (redirect) {
        return <Navigate to={'/'} />
    }
    
    
    return (
        <div>
            <AccountNav />
            {subpage === 'profile' && (
                <div className="text-center max-w-xl mx-auto">
                    Logged in as {user.name} ({user.email})
                    <button onClick={logout} className="primary max-w-sm mt-2">Logout</button>
                </div>
            )}

            {subpage === 'places' && (
                <PlacesPage />
            )}
        </div>
    )
}

