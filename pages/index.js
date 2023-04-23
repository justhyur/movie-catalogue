import STORE from '/lib/store.json';
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

export default function Search() {

  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(()=>{
    setIsMounted(true);
  },[]);

  const {
    tmdb_api_key, tmdb_main_url,
    yearsContent,
    loadingMedias, setLoadingMedias, properNames,
    translate, websiteLang,
    isYearRange
  } = useContext(Context);

  const formOptions = {
    mediaType: [
      {value: 'movie', label: translate('Movie')},
      {value: 'tv', label: translate('TV Show')}
    ],
    query: '',
    years: [{value: "", label: translate("Any")}, ...yearsContent.map(g=>({value: g.id, label: g.name}))],
  };

  const [formValues, setFormValues] = useLocalStorage('searchValues', {
    mediaType: formOptions.mediaType[0],
    query: '',
    year: formOptions.years[0],
  });

  useEffect(()=>{
    setFormValues(curr=>({
        ...curr,
        mediaType: formOptions.mediaType.filter(m=>m.value===curr.mediaType.value)[0],
        year: formOptions.years.filter(m=>m.value===curr.year.value)[0],
    }));
  },[websiteLang]) 

  const changeFormValue = (key, value) => {
    setFormValues(curr=>({...curr, [key]: value}));
  }

  const scrollElementRef = useRef();

  const [forcePageChange, setForcePageChange] = useState(null);

  const [lastSearch, setLastSearch] = useLocalStorage('lastSearch', null);
    const [currentSPage, setCurrentSPage] = useLocalStorage('currentSPage', 1);
    const [totalSPages, setTotalSPages] = useState();
    const [searchedMedias, setSearchedMedias] = useState([]);
    const searchMedias = (formValues) => {
        setLastSearch(null);
        setLastSearch(JSON.parse(JSON.stringify(formValues)));
    }
    useEffect(()=>{
        if(router.pathname !== '/' || !lastSearch){
            return;
        }
        const currentNames = properNames[lastSearch.mediaType.value];
        setLoadingMedias(Date.now());
        const params = {
            api_key: tmdb_api_key,
            query: lastSearch.query.trim().length > 0 ? lastSearch.query : tmdb_api_key,
            page: currentSPage,
            language: websiteLang,
            [currentNames.primary_release_year]: lastSearch.year.value
        }

        console.log(params)
       
        axios.get(`${tmdb_main_url}/search/${lastSearch.mediaType.value}`, {params})
        .then(res=>{
            console.log(res.data)
            setSearchedMedias(res.data.results);
            setCurrentSPage(res.data.page)
            setTotalSPages(res.data.total_pages);
            setLoadingMedias(Date.now());
        })
        .catch(err=>{
            console.error(err);
            setLoadingMedias(Date.now());
        });
    },[lastSearch, currentSPage, websiteLang, router]);

  return isMounted && (<>
    <Head>
      <title>{translate("Hyur's Media Library")}</title>
      <meta name="description" content="Created by Hyur" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <Header />
    <div className="my-container">
      
      <h2 className="page-title">{translate("Search")}</h2>

      <main>
        <div className="form">
          <div className="form-group">
            <label>{translate("Media type")}</label>
            <Select
              instanceId={"mediaType"} 
              options={formOptions.mediaType}
              value={formValues.mediaType}
              onChange={(e)=>{changeFormValue('mediaType', e)}}
              isSearchable={false}
              />
          </div>
          <div className="form-group">
            <label className="year-label">
              {translate("Year")}
            </label>
              <Select
                className={isYearRange? 'half' : ''}
                instanceId={"year"} 
                options={formOptions.years}
                value={formValues.year}
                onChange={(e)=>{changeFormValue('year', e)}}
                placeholder={translate("Select...")}
              />
          </div>
          <div className="form-group">
            <label></label>
            <Input
              type="text"
              value={formValues.query}
              onChange={(e)=>{changeFormValue('query', e.target.value);}}
            />
          </div>
          <div className="form-group submit">
            <button disabled={loadingMedias === true} onClick={()=>{searchMedias(formValues); setForcePageChange(1)}}>{translate("Search")}</button>
          </div>
        </div>
        <div ref={scrollElementRef}></div>
        {searchedMedias.length > 0 ? <>
          <Navigator
            forcePageChange={forcePageChange}
            setForcePageChange={setForcePageChange}
            currentPage={currentSPage}
            disabled={loadingMedias === true}
            pagesToShow={7}
            numPages={totalSPages}
            onChange={(pageNum)=>{setCurrentSPage(pageNum); scrollElementRef.current.scrollIntoView();}}
          />
          <div className="medias">
            {searchedMedias.map((media, i) => (
              <MediaCover mediaType={lastSearch.mediaType.value} showTitle data={media} key={`media${i}`} href={`/${lastSearch.mediaType.value}/${media.id}`}/>
            ))}
          </div>
        </>:
          <div className="message"><h2>{translate("No results found.")}</h2></div>
        }
      </main>

    </div>
  </>)
}
