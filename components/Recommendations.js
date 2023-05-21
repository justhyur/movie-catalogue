import Head from 'next/head';
import {useState, useEffect, useContext, useRef} from 'react';
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
import Header from '/components/Header';
import {FaStar} from 'react-icons/fa';
import Link from 'next/link';
import MovieScroller from '/components/MovieScroller';
import SearchForm from '/components/SearchForm';

export default function Recommendations({mediaType, mediaId}) {

  const [isMounted, setIsMounted] = useState(false);
  useEffect(()=>{
    setIsMounted(true);
  },[]);

  const {
    tmdb_api_key,
    translate, currentUser, websiteLang, properNames,
    isVoteAverageRange, isVoteCountRange, isYearRange,
    getMedia
  } = useContext(Context);

  const router = useRouter();
  useEffect(()=>{
    if(!currentUser){
      router.push("/");
    }
  },[currentUser]);

  useEffect(()=>{
    if(mediaId){
      loadMedia();
      if(lastMedia !== `${mediaType}-${mediaId}`){
        setMediaPages([]);
        loadPages(1, 5, []);
      }
      setLastMedia(`${mediaType}-${mediaId}`);
    }
  },[websiteLang, mediaId]);

  const loadMedia = async () => {
    const media = await getMedia(mediaType, mediaId, websiteLang);
    setMedia(media);
  }

  const [media, setMedia] = useState(null);
  const [mediaPages, setMediaPages] = useLocalStorage(`mediaPages-${mediaType}-recommendations`, []);
  const [lastMedia, setLastMedia] = useLocalStorage(`lastMedia-${mediaType}-recommendations`, false);
  const [isLoading, setIsLoading] = useState(false);

  const loadingRef = useRef();
  loadingRef.current = isLoading;

  const mediaPagesRef = useRef();
  mediaPagesRef.current = mediaPages;

  const getPage = async (pageNum) => {
      console.log("get", pageNum)
      const tmdb_main_url = "https://api.themoviedb.org/3";
      const params = {api_key: tmdb_api_key, page: pageNum};
      try{
          const res = await axios.get(`${tmdb_main_url}/${mediaType}/${mediaId}/recommendations`, {params});
          const results = [];
          res.data.results.forEach(result => {
              results.push({...result, page: pageNum});
          });
          return {...res.data, results};
      }catch(error){
          console.error(error);
      }
  }

  const loadPages = async (start, step, startPages) => {
      console.log(start, step, startPages)
      setIsLoading(true);
      const pages = JSON.parse(JSON.stringify(startPages));
      for(let i=start; i<start+step; i++){
          pages.push(await getPage(i));
      }
      setMediaPages(pages);
      setTimeout(()=>{setIsLoading(false)}, 1000);
  }

  return isMounted && currentUser && (<>
    <Head>
      <title>{translate("Hyur's Media Library")}</title>
      <meta name="description" content="Created by Hyur" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <Header />
    <div className="my-container">
      
      <h2 className="page-title">{translate("Recommendations")}</h2>

      <div>
        {media &&
          <MediaCover 
            showStatus 
            mediaType={mediaType} 
            data={media[websiteLang]}
            href={`/${mediaType}/${media[websiteLang].id}`}
          />
        }
      </div>

      <main>
        {mediaPages &&
          <MovieScroller 
            hideTrash
            mediaPages={mediaPages}
            isLoading={isLoading}
            mediaType={mediaType}
            onScrollEnd={()=>{
              const loading = loadingRef.current;
              if(loading){
                return;
              }
              const lastPage = mediaPagesRef.current[mediaPagesRef.current.length - 1];
              if(!lastPage || !lastPage.results || lastPage.results.length === 0){
                  return;
              }
              window.scrollBy({top: -50, behavior: 'instant'});
              loadPages(lastPage.page + 1, 5, mediaPagesRef.current);
            }}
          />
        }
      </main>

    </div>
  </>)
}
