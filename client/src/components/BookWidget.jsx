import { useContext, useEffect, useState } from "react"
import { differenceInCalendarDays } from 'date-fns';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from "./UserContext";


export default function BookWidget({place}) {

    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [numGuests, setNumGuests] = useState(1);
    const [name, setName] = useState('');
    const [number, setNumber] = useState('');
    const [redirect, setRedirect] = useState('');
    const {user} = useContext(UserContext);


    useEffect(() => {
        if (user) {
            setName(user.name)
        }
    }, [user])

    let numberOfDays = 0;
    if (checkIn && checkOut) {
        numberOfDays = differenceInCalendarDays(checkOut, checkIn);
    }

    async function handleBooking() {
        const response = await axios.post('/booking', {
            place: place._id, checkIn, checkOut, name, phone: number, price: numberOfDays * place.price
        });
        const bookingId = response.data._id;
        setRedirect(`/account/bookings/${bookingId}`);
    }

    if (redirect) {
        return <Navigate to={redirect} />
    }

    return (
        <div className="bg-white shadow p-4 rounded-2xl">
            <div className="text-2xl mb-2 text-center">
                Price: ${place.price} / per night
            </div>
            <div className="border rounded-2xl mt-4">
                <div className="flex-wrap md:flex lg:flex">
                    <div className="py-3 px-4 grow">
                        <label>Check In:</label>
                        <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}/>
                    </div>
                    <div className="border-t grow py-3 px-4 md:py-3 px-4 border-l lg:py-3 px-4 border-l">
                        <label>Check Out:</label>
                        <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}/>
                    </div>
                </div>
                <div className="py-3 px-4 border-t">
                    <label>
                        Number of Guests
                    </label>
                    <input type="number" value={numGuests} onChange={e => setNumGuests(e.target.value)}/>
                </div>
                {numberOfDays > 0 && (
                    <div className="py-3 px-4 border-t">
                        <label>Full Name:</label>
                        <input type="text" placeholder="John doe" value={name} onChange={e => setName(e.target.value)}/>

                        <label>Phone Number:</label>
                        <input type="tel" placeholder="(555) 555-1234" value={number} onChange={e => setNumber(e.target.value)}/>
                    </div>
                )}
            </div>

            <button onClick={handleBooking} className="primary mt-4">
                Book 
                {numberOfDays > 0 && (
                    <span> ${numberOfDays * place.price}</span>
                )}
            </button>

        </div>
    )
}