
import '../style/preloader.css';
import Svg from './svg';
import { useEffect } from'react';

function Preloader() {
    useEffect(() => {
        const preloader = document.querySelector('.preload');
        if (preloader) {
          preloader.classList.add('loaded');;
        }
      }, []);
    return (
        <div className="preload" id='preloader'>
            <Svg/>
            <p className="text">BINOMAGE</p>
        </div>
    );
}

export default Preloader;
