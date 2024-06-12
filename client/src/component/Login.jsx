import { useState, useContext } from "react"
import { UserContext } from "../context/UserContext"
import { Link, useNavigate } from "react-router-dom"

export default function Login()
{

// ------------------Variables------------------

const [userCreds, setUserCreds] = useState({
    email:"",
    password:""
})

const [message, setMessage] = useState({
    type:"invisible-msg",
    text:"Dummy Msg"
})

const navigate = useNavigate();

const loggedData = useContext(UserContext)

console.log(loggedData)


// ------------------Functions------------------

function handleInput(event)
{
    setUserCreds((prevState)=>{

        return({...prevState,[event.target.name]:event.target.value})
    })
}

function handleSubmit(event)
{

    event.preventDefault();
    console.log(userCreds)

// ------------------Sending the data to API------------------

fetch("http://localhost:8000/login",{
    method:"POST",
    body:JSON.stringify(userCreds),
    headers:{
        "Content-type":"application/json"
    }
})
.then((response)=> {
    if(response.status===404)
    {
        setMessage({type:"error", text:"Email Bulunumadı"})
    }
    else if(response.status===403)
    {
        setMessage({type:"error", text:"Hatalı Şifre"})
    }

    setTimeout(()=>{
        setMessage({type:"invisible-msg", text:"Dummy Msg"})
    },2500)

    return response.json();
})
.then((data)=>{
    
    if(data.token!==undefined)
    {
        localStorage.setItem("app-user",JSON.stringify(data));

        loggedData.setLoggedUser(data);
        
        navigate("/diet")
    }
    
})
.catch((err)=>{
    console.log(err)
})
}


    return(
        <section className="container">

            <form className="form" onSubmit={handleSubmit}>

                <h1>Galwin Nutrition App</h1>

                <input className="inp" type="email" onChange={handleInput} placeholder="Email Girin" name="email" value={userCreds.email} required />
                <input className="inp" type="password" onChange={handleInput} placeholder="Şifre Girin" name="password" value={userCreds.password} required/>

                <button className="btn">Giriş Yap</button>

                <p>Üye değil misiniz? <Link to="/register">Kayıt Ol</Link></p>

                <p className={message.type}>{message.text}</p>

            </form>

        </section>
    )
}