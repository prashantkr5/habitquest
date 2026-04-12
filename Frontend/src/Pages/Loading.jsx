import react, {useState} from 'react';
import './Loading.css';
import bgImg from '../Images/Loading-bg.jpeg';
import catCupImg from '../Images/vite.config.png';


function Loading(){

    return(
        <>
        <section className="loading-bg">
        <div className='loading-content'>
            <div className='Cat-cup-img'></div>
            <p>Playful. Productive. Practical.</p>
            <span className='loading-bar'></span>
            
            <p>Loading...</p>

        </div>
        </section>
        </>
    )

}

export default Loading