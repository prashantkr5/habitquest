import react, {useState} from 'react';
import './Signup.css'


function CardContainer(){

    return(
        <>
        <div className="Signup-card">
        <div className="Character-img"></div>


        <div className='Signup-container'>
            <h2>Welcome</h2>
            <p>Please share your Personal Data with us !</p>

            <button className='Google'><i class="fa-brands fa-google"></i>Google</button>
            <button className='Github'><i class="fa-brands fa-github"></i>Github</button>

            <p>OR</p>

            <div className='Form-field'>
            <div className='Name'>
                <label>First Name:</label>
                <input type='text' placeholder='What we should call you?'/>

                <label>Last Name:</label>
                <input type='text' placeholder='Enter your Last Name'/>
            </div>

            <label>Email:</label>
            <input type='email' placeholder='jin@gmail.com'/>

            <label>Password:</label>
            <input type='password' placeholder='Enter your Password' />
            <p>Must be atleast 8 Characters !</p>

            <button className='Signup-btn'>Sign Up</button>

            </div>

            <p>Already have an Account? </p>
        </div>
        
        
        </div>
        </>
    )

}

export default CardContainer