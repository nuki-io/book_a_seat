import { useRef, useState, useContext } from 'react';
import AuthContext from '../../context/AuthProvider';
import styled from 'styled-components';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import { PublicClientApplication, InteractionRequiredAuthError } from "@azure/msal-browser";
import { jwtDecode } from "jwt-decode";

const SERVER_URL =  process.env.REACT_APP_SERVER_URL;
const LOGIN_URL =  SERVER_URL + 'api/login';

const ElementStyle = styled.div`
  {
    margin-top: 2rem;
    text-align: left;
  }

  section {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 1rem;
    border: 1px solid rgba(0, 0, 0, 0.4);
    h1 {
      text-align:center;  
    }
  }

  form {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    flex-grow: 1;
    padding-bottom: 1rem;
  
    label, button {
      margin-top: 0.6rem;
    }
    img {
      display: flex;
      width: 200px;
    }
    
  }

  .wrapper_gif{
    margin-top: 12rem;
    border: 1px solid rgba(0, 0, 0, 0.4);
  }

`;

const Login = () => {
	const { setToken } = useContext(AuthContext);
  const userRef = useRef();
	const errRef = useRef();

	const [errMsg, setErrMsg] = useState('');

	const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create an instance of PublicClientApplication
    const msalConfig = {
      auth: {
          clientId: process.env.REACT_APP_AZURE_CLIENT_ID,
          authority: process.env.REACT_APP_AZURE_AUTHORITY,
      }
    };
    
    const msalInstance = new PublicClientApplication(msalConfig);
    await msalInstance.initialize();
    // Handle the redirect flows
    msalInstance
      .handleRedirectPromise()
      .then((tokenResponse) => {
        if (!tokenResponse ) {
          msalInstance.loginPopup({
              redirectUri: "http://localhost:3000/"
          }).then((token=> {
            const dToken = jwtDecode(token.accessToken);
            setToken({
              token: token.accessToken,
              user: dToken.unique_name,
              role: "admin" // TODO
            })
          }));
        } else {
          const dToken = jwtDecode(tokenResponse.accessToken);
          setToken({
            token: tokenResponse.accessToken,
            user: dToken.unique_name,
            role: "admin" // TODO
          })
        }
      })
      .catch((error) => {
        console.log(error)
      });
	};

	return (
		<ElementStyle>
      <section>
        {errMsg && (
        <Alert key="danger" variant="danger"
          ref={errRef}
          className={errMsg ? 'errmsg' : 'offscreen'}
        >
          {errMsg}
        </Alert>
        )}
        <h1>Sign In</h1>
        <form onSubmit={handleSubmit} className="form-group">
          <img src='nuki-logo.png' ></img>
          <Button type="submit">Sign In</Button>
        </form>
      </section>

		</ElementStyle>
	);
};

export default Login;