import Head from 'next/head';
import {useState, useEffect, useContext} from 'react';
import { Context } from '/lib/Context';
import {Form, FormGroup, Label, Input} from 'reactstrap';
import Select from 'react-select'; 
import {Navigator} from '/components/Navigator';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import axios from 'axios';
import {useLocalStorage} from '/lib/useLocalStorage';
import {useRouter} from 'next/router';
import moment from 'moment';
import {MediaCover} from '/components/MediaCover';
import {FaFilm} from 'react-icons/fa';
import Link from 'next/link';
import Header from '/components/Header';

export default function Favorites() {

  const [isMounted, setIsMounted] = useState(false);
  useEffect(()=>{
    setIsMounted(true);
  },[]);

  const {
    movieGenres, tvGenres, yearsContent, sortValues,
    discoveredMedias, singleMedia, setSingleMedia, discoverMedias, loadingMedias, loadSingleMedia, lastDiscover,
    totalDPages, setCurrentDPage, 
    translate, websiteLang, setWebsiteLang,
    languagesOptions, setFavorites, currentUser
  } = useContext(Context);

  const trashed = currentUser?.trashed ?? {movie: [], tv: []};

  const router = useRouter();
  useEffect(()=>{
    if(!currentUser){
      router.push("/");
    }
  },[currentUser]);

  const MediaSelect = ({value, onChange}) => {
    return (
        <div className="media-select">
            <div className={`media-option ${value === 'movie' ? 'active' : ''}`} onClick={()=>{onChange('movie')}}>{translate("Movies")}</div>
            <div className={`media-option ${value === 'tv' ? 'active' : ''}`} onClick={()=>{onChange('tv')}}>{translate("TV Shows")}</div>
        </div>
    )
  }

  const [selectedMedia, setSelectedMedia] = useLocalStorage('selectedMedia', 'movie');

  return isMounted && currentUser && (<>
    <Header />
    <div className="my-container">
        <h2 className="page-title">{translate("Trash")}</h2>
        <main>
            <MediaSelect value={selectedMedia} onChange={(mediaType)=>{setSelectedMedia(mediaType)}}/>

            <div className="media-group">
                {trashed[selectedMedia].length === 0 ?
                    <div className="message">
                        <h3>{translate(`You have no trashed ${selectedMedia === 'movie' ? 'Movies' : 'TV Shows'}.`)}</h3>
                        <Link className="c-button" href="/discover">{translate("Discover")}</Link>
                    </div>
                :
                    <div className="medias">
                        {trashed[selectedMedia].map((media, i) => (
                            <MediaCover 
                              mediaType={selectedMedia} 
                              showTitle 
                              data={media} 
                              key={`media${i}`} 
                              href={`/${selectedMedia}/${media.id}`}
                            />
                        ))}
                    </div>
                }
            </div>
        </main>
    </div>
  </>)
}
