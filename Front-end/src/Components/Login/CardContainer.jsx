import { useState } from "react"
import './Login.css'

export default function Cardcontainer() {

    return(
        <>
        <div className="Login-card">
        <div className="Character-img">
            
        </div> 
        {/* wo transparent card  */}
        <div className="login-container">
            <h2 id="hello">Hi !</h2>
            <h2 id="welcome">Welcome Back</h2>
        <form>
            {/* email input */}
            <div className="form-group">
                <label>Email</label>
                <input
                type="email"
                placeholder="Enter Your Email"
                >
                
                </input>
               
                

                <br />
                
                {/* password input */}
                <lable>Password</lable>
                <input 
                type="password"
                placeholder="Enter your password"
                >
                </input>
                {/* password ka toogle img */}
                <br />
                <span className="forget-password"><a href="#">Recover Password ?</a></span>
                <br />
                <button className="login-btn">Login</button>

                <div className="or-divider">
  <hr /><span>Or continue with</span><hr />
</div>

                <div className="social-login">
                    <button className="social-btn"><i className="fa-brands fa-google"></i>Google</button>
                    <button className="social-btn"><i className="fa-brands fa-facebook"></i>Facebook</button>
                    <button className="social-btn"><i className="fa-brands fa-apple"></i>Apple</button>
                </div>


                <p className="no-account">Don't have an account? <a href="/Signup">Create Account</a></p>


            </div>

        </form>
        </div>
        </div>
        </>

    )
}