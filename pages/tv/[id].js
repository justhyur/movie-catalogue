import {useRouter} from 'next/router';
import {MediaPopup} from '/components/MediaPopup';
import {useState, useEffect, useContext} from 'react';
import { Context } from '/lib/Context';

export default function Tv() {

    const {
        User
    } = useContext(Context);

    const {user} = User;
    
    const router = useRouter();
    useEffect(()=>{
    if(!user){
        router.push("/");
    }
    },[user]);

    const {id} = router.query;

    const [isMounted, setIsMounted] = useState(false);
    useEffect(()=>{
        setIsMounted(true);
    },[]);

    return isMounted && id && user && <MediaPopup mediaType="tv" id={id} />
}
