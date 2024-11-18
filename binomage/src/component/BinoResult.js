import React, { useState } from 'react';

function BinoResult({ number, nomFilleule, nomParrain, contact, chambre,Svg,sexe }) {
    const imgDest = require("../images/logo23.png");

    const [imgSrc, setImgSrc] = useState(`/images/${number}.jpg`);
    const defaultImg = "/images/image.jpg"; // Chemin de l'image par défaut

    const handleImageError = () => {
        setImgSrc(defaultImg);
    };
    
    return (
        <div className="container" id="card">
            <div className="row justify-content-center">
                <div className="col-8 col-md-6">
                    <div className="jelly-card">
                        <div className="card py-3">
                            <div className="row">
                                <div className="col-10 col-md-4 col-lg-3 jelly-bloc text-center text-md-start">
                                    <img src={imgDest} className="card-img-top card-pic slowfloat2s" alt="meduse" />
                                </div>
                                <div className="card-content-bino">
                                    <div className="card-body">
                                        <div className="image">
                                        <img 
                                            src={imgSrc} 
                                            alt="image-parrain" 
                                            onError={handleImageError} 
                                        />
                                        </div>
                                        <div className="info">
                                            <h5 className="card-title">{nomFilleule}</h5>
                                            <div className="line"></div>
                                            <h1 className="card-text">{sexe==="H"? 'Parrain:':'Maraine:'} <span>{nomParrain}</span></h1>
                                            <h1 className="card-text">Contact: <span>{contact}</span></h1>
                                            <h1 className="card-text">Chambre: <span>{chambre}</span></h1>
                                            <i className={`fas fa-disease slowfloat3s bx ${Svg}`}></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BinoResult;
