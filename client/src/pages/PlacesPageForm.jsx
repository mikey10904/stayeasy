import Perks from "../components/Perks";
import PhotosUploader from "../components/PhotosUploader";
import { useEffect, useState } from "react";
import axios from "axios";
import AccountNav from "./AccountNav";
import { Navigate, useParams } from "react-router-dom";

export default function PlacesPageForm() {

    const {id} = useParams();
    
    const [title, setTitle] = useState('');
    const [address, setAddress] = useState('');
    const [description, setDescription] = useState('');
    const [addedPhotos, setAddedPhotos] = useState([]);
    const [perks, setPerks] = useState([]);
    const [extraInfo, setExtraInfo] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [maxGuests, setMaxGuests] = useState(1);
    const [price, setPrice] = useState(100);
    const [redirect, setRedirect] = useState(false);

    useEffect(() => {
        if (!id) {
            return;
        }
        axios.get('/places/' + id)
            .then((response) => {
                const {data} = response;
                setTitle(data.title)
                setAddress(data.address)
                setAddedPhotos(data.photos)
                setDescription(data.description)
                setPerks(data.perks)
                setExtraInfo(data.extraInfo)
                setCheckIn(data.checkIn)
                setCheckOut(data.checkOut)
                setMaxGuests(data.maxGuests)
                setPrice(data.price)
            })
    }, [id])


    async function savePlace(event) {
        event.preventDefault();
        const placeData = {title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price}

        if (id) {
            await axios.put('/places', {
                id, ...placeData  
            }); 

            setRedirect(true);
        } else {
            await axios.post('/places', placeData); 

            setRedirect(true);
        }


        
    }

    if (redirect) {
        return <Navigate to={'/account/places'} />
    }


    return (
        <div>
            <AccountNav />
            <form onSubmit={savePlace}>

                <h2 className="text-2xl mt-4" >Title</h2>
                <p className="text-gray-500 text-sm">title for your place</p>
                <input type="text" placeholder="Title, for example: My Lovely Apt" value={title} onChange={event => setTitle(event.target.value)}/>

                <h2 className="text-2xl mt-4" >Address</h2>
                <p className="text-gray-500 text-sm">Address to this place</p>
                <input type="text" placeholder="Address" value={address} onChange={event => setAddress(event.target.value)}/>

                <h2 className="text-2xl mt-4" >Photos</h2>
                <p className="text-gray-500 text-sm">More = better</p>
                <PhotosUploader addedPhotos={addedPhotos} onChange={setAddedPhotos} />
                <h2 className="text-2xl mt-4" >Description</h2>
                <p className="text-gray-500 text-sm">Description of the place</p>
                <textarea value={description} onChange={event => setDescription(event.target.value)}></textarea>

                <h2 className="text-2xl mt-4" >Perks</h2>
                <p className="text-gray-500 text-sm">Perks of the place</p>
                <div className="grid mt-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                    <Perks selected={perks} onChange={setPerks} />
                </div>

                <h2 className="text-2xl mt-4" >Extra Info</h2>
                <p className="text-gray-500 text-sm">Ex: House rules</p>
                <textarea value={extraInfo} onChange={event => setExtraInfo(event.target.value)}></textarea>

                <h2 className="text-2xl mt-4" >Check in & Check out times</h2>
                <p className="text-gray-500 text-sm">Add check in and check out times</p>
                <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
                    <div>
                        <h3 className="mt-2 -mb-1">
                            Check in time
                        </h3>
                        <input type="text" placeholder="15:00" value={checkIn} onChange={event => setCheckIn(event.target.value)}/>
                    </div>
                    <div>
                        <h3 className="mt-2 -mb-1">
                            Check out time
                        </h3>
                        <input type="text" placeholder="11:00" value={checkOut} onChange={event => setCheckOut(event.target.value)}/>
                    </div>
                    <div>
                        <h3 className="mt-2 -mb-1">
                            Max number of guest
                        </h3>
                        <input type="number" placeholder="6" value={maxGuests} onChange={event => setMaxGuests(event.target.value)}/>
                    </div>
                    <div>
                        <h3 className="mt-2 -mb-1">
                            Price per Night
                        </h3>
                        <input type="text" placeholder="$6" value={price} onChange={event => setPrice(event.target.value)}/>
                    </div>
                </div>
                    
                <button className=" primary my-4">Save</button>

            </form>
        </div>    
    )
    
}